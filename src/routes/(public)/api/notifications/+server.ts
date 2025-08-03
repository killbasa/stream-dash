import { ok } from '$lib/server/api';
import { zWebhookPayload } from '$lib/server/cloudflare/webhooks';
import { json } from '@sveltejs/kit';
import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async (event) => {
	if (event.request.headers.get('Content-Type') !== 'application/json') {
		console.log('Invalid content type:', event.request.headers.get('Content-Type'));
		return json({ message: 'Invalid request' }, { status: 400 });
	}

	if (!event.request.body) {
		console.log('No body provided');
		return json({ message: 'Invalid request' }, { status: 400 });
	}

	const header = event.request.headers.get('cf-webhook-auth');
	if (!header) {
		console.log('No auth header found');
		return json({ message: 'Invalid request' }, { status: 400 });
	}

	try {
		if (!timingSafeEqual(Buffer.from(header), Buffer.from(env.CLOUDFLARE_WEBHOOK_SECRET))) {
			console.log('Webhook auth header is invalid');
			return json({ message: 'Invalid request' }, { status: 400 });
		}

		const raw = await event.request.json();
		console.log('raw:', raw);

		const data = zWebhookPayload.safeParse(raw);
		if (!data.success) {
			console.log('Invalid payload:', data.error);
			return json({ message: 'Invalid request' }, { status: 400 });
		}

		console.log('parsed:', data.data);

		return ok();
	} catch (err) {
		console.log('Error parsing JSON:', err);
		return json({ message: 'Invalid JSON body' }, { status: 400 });
	}
};
