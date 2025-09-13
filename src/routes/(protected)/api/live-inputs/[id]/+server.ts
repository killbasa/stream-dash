import { ok } from '$lib/server/api';
import { prisma } from '$lib/server/db/client';
import { LiveInputType } from '$lib/server/db/generated/client';
import { hasPermission } from '$src/lib/server/utils';
import { getCloudflareServiceAccount } from '$src/lib/server/cloudflare/service-account';
import { json } from '@sveltejs/kit';
import z from 'zod';
import type { RequestHandler } from './$types';

const LiveInputPutBody = z.object({
	type: z.enum([LiveInputType.ingest, LiveInputType.return]),
});

export const PUT: RequestHandler = async ({ locals, params, request }) => {
	if (!hasPermission(locals.user, ['live-inputs/edit'])) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const data = LiveInputPutBody.safeParse(await request.json());
	if (!data.success) {
		return json(
			{ message: 'Invalid request body', errors: data.error.issues },
			{ status: 400 },
		);
	}

	const liveInput = await prisma.liveInput.update({
		where: {
			id: params.id,
		},
		data: {
			type: data.data.type,
		},
	});

	return json(liveInput);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!hasPermission(locals.user, ['live-inputs/edit'])) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const { cloudflare, accountId } = getCloudflareServiceAccount();

	await prisma.$transaction(async (tx) => {
		const liveInput = await tx.liveInput.findUniqueOrThrow({
			where: { id: params.id },
			select: {
				cloudflareId: true,
				ingestFor: true,
				playbackFor: true,
			},
		});

		if (liveInput.ingestFor.length > 0 || liveInput.playbackFor.length > 0) {
			throw new Error('Live input has associated blocks and cannot be deleted.');
		}

		await cloudflare.stream.liveInputs.delete(liveInput.cloudflareId, {
			account_id: accountId,
		});

		await tx.liveInput.delete({
			where: { id: params.id },
		});
	});

	return ok(204);
};
