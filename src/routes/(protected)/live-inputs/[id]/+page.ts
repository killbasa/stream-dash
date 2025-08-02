import type { LiveInput } from 'cloudflare/resources/stream/live-inputs.mjs';
import type { PageLoad } from './$types';

interface LiveInputStatus {
	ingestProtocol: string;
	state: 'connected' | 'disconnected';
	statusEnteredAt: string;
	statusLastSeen?: string;
}

interface LiveInputStatusResponse {
	current: LiveInputStatus;
	history: LiveInputStatus[];
}

export const load: PageLoad = ({ fetch, params }) => {
	const get: Promise<Omit<LiveInput, 'status'> & { status: LiveInputStatusResponse }> = fetch(
		`/api/live-inputs/${params.id}`,
	).then((res) => res.json());

	return {
		liveInput: get,
	};
};
