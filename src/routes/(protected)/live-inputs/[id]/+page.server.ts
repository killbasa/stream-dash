import { cloudflare } from '$lib/server/cloudflare/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (locals.user?.role !== 'admin' && !locals.user?.scopes?.includes('live-inputs')) {
		error(403, 'Forbidden: You are missing the "live-inputs" scope.');
	}

	const liveInput = await cloudflare.stream.liveInputs.get(params.id, {
		account_id: env.CLOUDFLARE_ACCOUNT_ID!,
	});

	return {
		liveInput,
	};
};
