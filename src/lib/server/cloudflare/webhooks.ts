import Cloudflare, { NotFoundError } from 'cloudflare';
import z from 'zod';

export type WebhookApiResponse = {
	notification_url: string;
	notificationUrl: string;
	modified: string;
	secret: string;
};

export const zWebhookPayload = z.object({
	name: z.string(),
	text: z.string(),
	data: z.object({
		event_type: z.enum([
			'live_input.disconnected',
			'live_input.connected',
			'live_input.errored',
		]),
		input_id: z.string(),
		notification_name: z.string(),
		updated_at: z.string(),
	}),
	ts: z.number(),
	policy_id: z.string(),
	policy_name: z.string(),
	alert_type: z.literal('stream_live_notifications'),
});

export const getWebhook = async (
	client: Cloudflare,
	accountId: string,
): Promise<WebhookApiResponse | null> => {
	const response = await client.stream.webhooks
		.get({
			account_id: accountId,
		})
		.then((response) => response as WebhookApiResponse)
		.catch((err) => {
			if (err instanceof NotFoundError) {
				return null;
			}

			console.error('Error fetching webhooks:', err);
			return null;
		});

	return response;
};

export const createWebhook = async (
	client: Cloudflare,
	accountId: string,
	url: string,
): Promise<WebhookApiResponse | null> => {
	const response = await client.stream.webhooks
		.update({
			account_id: accountId,
			notificationUrl: url,
		})
		.then((response) => response as WebhookApiResponse)
		.catch((err) => {
			console.error('Error updating webhooks:', err);
			return null;
		});

	return response;
};
