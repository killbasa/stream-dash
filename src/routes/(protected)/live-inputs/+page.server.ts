import { cloudflare } from '$lib/server/cloudflare/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { LiveInputListResponse } from 'cloudflare/resources/stream.mjs';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.role !== 'admin' && !locals.user?.scopes?.includes('live-inputs')) {
		error(403, 'Forbidden: You are missing the "live-inputs" scope.');
	}

	const liveInputs = await cloudflare.stream.liveInputs.list({
		account_id: env.CLOUDFLARE_ACCOUNT_ID!,
	});

	return {
		// This library sucks
		liveInputs: liveInputs as LiveInputListResponse['liveInputs'],
	};
};
