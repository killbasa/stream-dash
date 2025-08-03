import { ok } from '$lib/server/api';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	if (event.request.headers.get('Content-Type') !== 'application/json') {
		return new Response('Invalid content type', { status: 400 });
	}

	if (!event.request.body) {
		return new Response('No body provided', { status: 400 });
	}

	// Parse the JSON body
	try {
		const data = await event.request.json();
		console.log(data);

		return ok();
	} catch (err) {
		console.log('Error parsing JSON:', err);
		return new Response('Invalid JSON body', { status: 400 });
	}
};
