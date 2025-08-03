import { cloudflare } from '$lib/server/cloudflare/client';
import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { LiveInputType } from '$lib/server/db/generated/client';
import { json } from '@sveltejs/kit';
import z from 'zod';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const LiveInputPostBody = z.object({
	name: z.string().min(3),
	type: z.enum([LiveInputType.ingest, LiveInputType.return]),
	description: z.string().optional(),
});

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
});

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!hasPermission(locals.user, ['admin', 'editor'], 'live-inputs')) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const data = LiveInputPostBody.safeParse(await request.json());
	if (!data.success) {
		return json(
			{ message: 'Invalid request body', errors: data.error.issues },
			{ status: 400 },
		);
	}

	const result = await prisma.$transaction(async (tx) => {
		const liveInput = await cloudflare.stream.liveInputs.create({
			account_id: env.CLOUDFLARE_ACCOUNT_ID,
			meta: {
				name: data.data.name,
			},
		});

		const obj = LiveInputResponseObj.parse(liveInput);

		// await cloudflare.stream.webhooks.update({
		// 	account_id: env.CLOUDFLARE_ACCOUNT_ID,
		// 	notificationUrl: `${env.PUBLIC_BASE_URL}/api/webhooks/${obj.uid}`,
		// });

		return tx.liveInput.create({
			data: {
				cloudflareId: obj.uid,
				type: data.data.type,
				name: obj.meta.name,
				description: data.data.description,
				ingestWebrtcUrl: obj.webRTC.url,
				playbackWebrtcUrl: obj.webRTCPlayback.url,
			},
		});
	});

	return json(result, { status: 201 });
};
