import { cloudflare } from '$lib/server/cloudflare/client';
import { prisma } from '$lib/server/db/client';
import { ok } from '$lib/server/api';
import { auth } from '$src/lib/server/auth';
import { json } from '@sveltejs/kit';
import z from 'zod';
import type { RequestHandler } from './$types';
import type { LiveInputCreateManyInput } from '$lib/server/db/generated/models';
import { env } from '$env/dynamic/private';

const LiveInputResponseList = z.array(
	z.object({
		uid: z.string(),
		created: z.string().datetime(),
		modified: z.string().datetime(),
		meta: z.object({
			name: z.string(),
		}),
		deleteRecordingAfterDays: z.number().nullable(),
	}),
);

const LiveInputResponseObj = z.object({
	uid: z.string(),
	meta: z.object({
		name: z.string(),
	}),
	webRTC: z.object({
		url: z.string(),
	}),
	webRTCPlayback: z.object({
		url: z.string(),
	}),
	status: z
		.object({
			current: z
				.object({
					state: z.enum(['connected', 'disconnected']),
				})
				.optional(),
		})
		.nullish(),
});

let lock = false;

export const POST: RequestHandler = async ({ request }) => {
	const hasPermission = await auth.api.hasPermission({
		headers: request.headers,
		body: {
			permissions: {
				liveinputs: ['update'],
			},
		},
	});
	if (!hasPermission.success) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	if (lock) {
		return json({ message: 'Sync already in progress' }, { status: 429 });
	}

	lock = true;

	try {
		await prisma.$transaction(async (tx) => {
			// The return type from this is wrong (2025-08-03)
			const liveInputsRaw = await cloudflare.stream.liveInputs.list({
				account_id: env.CLOUDFLARE_ACCOUNT_ID,
			});

			const liveInputs = LiveInputResponseList.parse(liveInputsRaw);

			console.log(`Found ${liveInputs.length} live inputs in Cloudflare.`);

			const existing = await tx.liveInput.findMany({
				where: {
					cloudflareId: {
						in: liveInputs.map((input) => input.uid),
					},
				},
				select: {
					cloudflareId: true,
				},
			});

			const liveInputsToCreate = liveInputs.filter((input) => {
				return !existing.some((e) => e.cloudflareId === input.uid);
			});

			console.log(`Found ${liveInputsToCreate.length} new live inputs to create.`);

			const toCreate: LiveInputCreateManyInput[] = [];

			for (const input of liveInputsToCreate) {
				const res = await cloudflare.stream.liveInputs.get(input.uid, {
					account_id: env.CLOUDFLARE_ACCOUNT_ID,
				});

				const inputData = LiveInputResponseObj.parse(res);

				toCreate.push({
					cloudflareId: inputData.uid,
					name: inputData.meta.name,
					ingestWebrtcUrl: inputData.webRTC.url,
					playbackWebrtcUrl: inputData.webRTCPlayback.url,
					status: inputData.status?.current?.state,
				});
			}

			console.log(`Creating ${toCreate.length} new live inputs.`);

			return await tx.liveInput.createMany({
				data: toCreate,
				skipDuplicates: true,
			});
		});

		lock = false;

		return ok();
	} catch (err) {
		lock = false;

		console.error('Error syncing live inputs:', err);
		return json({ message: 'Failed to sync live inputs' }, { status: 500 });
	}
};
