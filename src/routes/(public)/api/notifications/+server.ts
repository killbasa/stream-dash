import { ok } from '$lib/server/api';
import { zWebhookPayload } from '$lib/server/cloudflare/webhooks';
import { json } from '@sveltejs/kit';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async (event) => {
	if (event.request.headers.get('Content-Type') !== 'application/json') {
		console.log('Invalid content type:', event.request.headers.get('Content-Type'));
		return json({ message: 'Invalid content type' }, { status: 400 });
	}

	if (!event.request.body) {
		console.log('No body provided');
		return json({ message: 'No body provided' }, { status: 400 });
	}

	const header = event.request.headers.get('Webhook-Signature');
	if (!header) {
		console.log('No Webhook-Signature header found:', event.request.headers);
		return json({ message: 'Invalid request' }, { status: 400 });
	}

	// Parse the JSON body
	try {
		const [time, sig1] = header.split(',');
		const message = time + '.' + JSON.stringify(event.request.body);

		const hmac = createHmac('sha256', env.CLOUDFLARE_WEBHOOK_SECRET)
			.update(message)
			.digest('hex');

		if (timingSafeEqual(Buffer.from(sig1, 'hex'), Buffer.from(hmac, 'hex'))) {
			console.log('Webhook signature is valid');
			return json({ message: 'Invalid signature' }, { status: 400 });
		}

		const raw = await event.request.json();
		console.log('raw:', raw);

		const data = zWebhookPayload.safeParse(raw);
		if (!data.success) {
			console.log('Invalid payload:', data.error);
			return json({ message: 'Invalid payload' }, { status: 400 });
		}

		console.log('parsed:', data.data);

		return ok();
	} catch (err) {
		console.log('Error parsing JSON:', err);
		return json({ message: 'Invalid JSON body' }, { status: 400 });
	}
};
