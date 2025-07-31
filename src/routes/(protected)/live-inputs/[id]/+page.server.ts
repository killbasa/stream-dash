import { cloudflare } from '$lib/server/cloudflare/client';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ params }) => {
	const liveInput = await cloudflare.stream.liveInputs.get(params.id, {
		account_id: env.CLOUDFLARE_ACCOUNT_ID!,
	});

	return {
		liveInput,
	};
};
