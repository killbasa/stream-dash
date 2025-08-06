import { cloudflare } from '$lib/server/cloudflare/client';
import { ok } from '$lib/server/api';
import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { LiveInputType } from '$lib/server/db/generated/client';
import { json } from '@sveltejs/kit';
import z from 'zod';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const LiveInputPutBody = z.object({
	type: z.enum([LiveInputType.ingest, LiveInputType.return]),
});

export const PUT: RequestHandler = async ({ locals, request, params }) => {
	if (!hasPermission(locals.user, ['admin', 'user'], 'live-inputs-edit')) {
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

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!hasPermission(locals.user, ['admin', 'user'], 'live-inputs-edit')) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

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
			account_id: env.CLOUDFLARE_ACCOUNT_ID,
		});

		await tx.liveInput.delete({
			where: { id: params.id },
		});
	});

	return ok(204);
};
