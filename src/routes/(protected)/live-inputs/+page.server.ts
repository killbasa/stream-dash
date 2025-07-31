import { cloudflare } from '$lib/server/cloudflare/client';
import type { PageServerLoad } from './$types';
import type { LiveInputListResponse } from 'cloudflare/resources/stream.mjs';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async () => {
	const liveInputs = await cloudflare.stream.liveInputs.list({
		account_id: env.CLOUDFLARE_ACCOUNT_ID!,
	});

	return {
		// This library sucks
		liveInputs: liveInputs as LiveInputListResponse['liveInputs'],
	};
};
