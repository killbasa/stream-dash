import { prisma } from '$lib/server/db/client';
import { LiveInputType } from '$lib/server/db/generated/client';
import { cloudflare } from '$lib/server/cloudflare/client';
import { auth } from '$src/lib/server/auth';
import { error, fail } from '@sveltejs/kit';
import z from 'zod';
import type { LiveInput } from '$lib/server/db/generated/client';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ request, depends }) => {
	const result = await auth.api.hasPermission({
		headers: request.headers,
		body: {
			permissions: {
				liveinputs: ['read'],
			},
		},
	});
	if (!result.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	depends('api:live-inputs');

	const liveInputs = await prisma.liveInput.findMany({
		orderBy: {
			createdAt: 'desc',
		},
	});

	const validLiveInputs: LiveInput[] = [];
	const pendingLiveInputs: LiveInput[] = [];
	for (const liveInput of liveInputs) {
		if (liveInput.type) {
			validLiveInputs.push(liveInput);
		} else {
			pendingLiveInputs.push(liveInput);
		}
	}

	return {
		liveInputs: validLiveInputs,
		pendingLiveInputs,
	};
};

const LiveInputPostBody = z.object({
	name: z.string().min(3),
	type: z.enum(LiveInputType),
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

export const actions: Actions = {
	create: async ({ request }) => {
		const result = await auth.api.hasPermission({
			headers: request.headers,
			body: {
				permissions: {
					liveinputs: ['create'],
				},
			},
		});
		if (!result.success) {
			error(403, 'Forbidden: You do not have permission to access this resource.');
		}

		const formData = await request.formData();

		const data = LiveInputPostBody.safeParse({
			name: formData.get('liveinput_name'),
			type: formData.get('liveinput_type'),
			description: formData.get('liveinput_description'),
		});

		if (!data.success) {
			return fail(400, { message: 'Invalid request body', errors: data.error.issues });
		}

		await prisma.$transaction(async (tx) => {
			const liveInput = await cloudflare.stream.liveInputs.create({
				account_id: env.CLOUDFLARE_ACCOUNT_ID,
				meta: {
					name: data.data.name,
				},
			});

			const obj = LiveInputResponseObj.parse(liveInput);

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

		return { message: 'Live Input created' };
	},
};
