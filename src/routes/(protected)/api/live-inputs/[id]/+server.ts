import { cloudflare } from '$lib/server/cloudflare/client';
import { ok } from '$lib/server/api';
import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!hasPermission(locals.user, ['editor'], 'live-inputs')) {
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
