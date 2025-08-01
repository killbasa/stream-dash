import { cloudflare } from '$lib/server/cloudflare/client';
import { json } from '@sveltejs/kit';
import z from 'zod';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ locals }) => {
	if (locals.user?.role !== 'admin' && !locals.user?.scopes?.includes('live-inputs')) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const liveInputs = await cloudflare.stream.liveInputs.list({
		account_id: env.CLOUDFLARE_ACCOUNT_ID!,
	});

	return json(liveInputs, { status: 200 });
};

const LiveInputPostBody = z.object({
	name: z.string().min(3),
});

export const POST: RequestHandler = async ({ locals, request }) => {
	if (locals.user?.role !== 'admin' && !locals.user?.scopes?.includes('live-inputs')) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const data = LiveInputPostBody.safeParse(await request.json());
	if (!data.success) {
		return json(
			{ message: 'Invalid request body', errors: data.error.issues },
			{ status: 400 },
		);
	}

	const liveInput = await cloudflare.stream.liveInputs.create({
		account_id: env.CLOUDFLARE_ACCOUNT_ID!,
		meta: {
			name: data.data.name,
		},
	});

	return json(liveInput, { status: 201 });
};
