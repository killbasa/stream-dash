import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	return new Response('OK', {
		status: 200,
		headers: {
			'Content-Type': 'text/plain',
		},
	});
};
