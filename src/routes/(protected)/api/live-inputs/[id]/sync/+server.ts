import { cloudflare } from '$lib/server/cloudflare/client';
import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { LiveInputStatus } from '$lib/server/db/generated/client';
import { json } from '@sveltejs/kit';
import z from 'zod';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const LiveInputStatusResponseObj = z
	.object({
		status: z
			.object({
				current: z
					.object({
						state: z.enum(LiveInputStatus),
					})
					.optional(),
			})
			.nullish(),
	})
	.optional();

// Prevent concurrent sync requests
const lock = new Set<string>();

export const POST: RequestHandler = async ({ locals, params }) => {
	if (!hasPermission(locals.user, ['admin', 'user'], 'live-inputs-edit')) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	if (lock.has(params.id)) {
		return json({ message: 'Sync already in progress' }, { status: 429 });
	}

	lock.add(params.id);

	try {
		const result = await prisma.$transaction(async (tx) => {
			const dbLiveInput = await tx.liveInput.findUniqueOrThrow({
				where: { id: params.id },
				select: {
					cloudflareId: true,
				},
			});

			const liveInput = await cloudflare.stream.liveInputs.get(dbLiveInput.cloudflareId, {
				account_id: env.CLOUDFLARE_ACCOUNT_ID,
			});

			const data = LiveInputStatusResponseObj.parse(liveInput);

			return tx.liveInput.update({
				where: { id: params.id },
				data: {
					status: data?.status?.current?.state,
				},
			});
		});

		lock.delete(params.id);

		return json(result, { status: 201 });
	} catch (err) {
		lock.delete(params.id);

		console.error('Error syncing live input:', err);
		return json({ message: 'Failed to sync live input' }, { status: 500 });
	}
};
