import { cloudflare } from '$lib/server/cloudflare/client';
import { ok } from '$lib/server/api';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ locals, params }) => {
	if (locals.user?.role !== 'admin' && !locals.user?.scopes?.includes('live-inputs')) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const liveInput = await cloudflare.stream.liveInputs.get(params.id, {
		account_id: env.CLOUDFLARE_ACCOUNT_ID!,
	});

	return json(liveInput, { status: 200 });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (locals.user?.role !== 'admin' && !locals.user?.scopes?.includes('live-inputs')) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	await cloudflare.stream.liveInputs.delete(params.id, {
		account_id: env.CLOUDFLARE_ACCOUNT_ID!,
	});

	return ok(204);
};
