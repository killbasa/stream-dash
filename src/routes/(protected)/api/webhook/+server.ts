import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = () => {
	return json({
		message: 'OK',
	});
};
