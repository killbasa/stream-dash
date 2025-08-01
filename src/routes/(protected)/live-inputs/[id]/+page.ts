import type { LiveInput } from 'cloudflare/resources/stream/live-inputs.mjs';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ fetch, params }) => {
	const get: Promise<LiveInput> = fetch(`/api/live-inputs/${params.id}`).then((res) =>
		res.json(),
	);

	return {
		liveInput: get,
	};
};
