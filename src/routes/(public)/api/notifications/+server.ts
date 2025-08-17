import { ok } from '$lib/server/api';
import { zWebhookPayload } from '$lib/server/cloudflare/webhooks';
import { prisma } from '$lib/server/db/client';
import { LiveInputStatus } from '$lib/server/db/generated/client';
import { json } from '@sveltejs/kit';
import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const failWebhook = () => json({ message: 'Invalid request' }, { status: 400 });

export const POST: RequestHandler = async (event) => {
	if (event.request.headers.get('Content-Type') !== 'application/json') {
		console.log('Invalid content type:', event.request.headers.get('Content-Type'));
		return failWebhook();
	}

	if (!event.request.body) {
		console.log('No body provided');
		return failWebhook();
	}

	const header = event.request.headers.get('cf-webhook-auth');
	if (!header) {
		console.log('No auth header found');
		return failWebhook();
	}

	try {
		if (!timingSafeEqual(Buffer.from(header), Buffer.from(env.CLOUDFLARE_WEBHOOK_SECRET!))) {
			console.log('Webhook auth header is invalid');
			return failWebhook();
		}

		const raw = await event.request.json();
		const data = zWebhookPayload.safeParse(raw);
		if (!data.success) {
			console.log('Invalid payload:', data.error);
			return failWebhook();
		}

		const status = getStatus(data.data.data.event_type);

		await prisma.liveInput.update({
			where: {
				cloudflareId: data.data.data.input_id,
			},
			data: {
				status,
			},
		});

		console.log('Live input status updated:', data.data.data.input_id, status ?? 'Unknown');

		return ok();
	} catch (err) {
		console.log('Error parsing JSON:', err);
		return failWebhook();
	}
};

function getStatus(eventType: string): LiveInputStatus | null {
	switch (eventType) {
		case 'live_input.connected':
			return LiveInputStatus.connected;
		case 'live_input.disconnected':
			return LiveInputStatus.disconnected;
		case 'live_input.errored':
			return LiveInputStatus.errored;
		default:
			return null;
	}
}
