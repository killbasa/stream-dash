import { ok } from '$lib/server/api';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	const data = await event.request.json();

	console.log(data);

	return ok();
};
