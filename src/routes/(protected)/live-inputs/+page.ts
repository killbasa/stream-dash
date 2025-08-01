import type { PageLoad } from './$types';
import type { LiveInputListResponse } from 'cloudflare/resources/stream.mjs';

export const load: PageLoad = ({ fetch }) => {
	const get: Promise<LiveInputListResponse['liveInputs']> = fetch('/api/live-inputs').then(
		(res) => res.json(),
	);

	return {
		liveInputs: get,
	};
};
