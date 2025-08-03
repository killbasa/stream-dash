import { cloudflare } from './client';
import { NotFoundError } from 'cloudflare';
import { env } from '$env/dynamic/private';

export type WebhookResponse = {
	notification_url: string;
	notificationUrl: string;
	modified: string;
	secret: string;
};

export const getWebhook = async (): Promise<WebhookResponse | null> => {
	const response = await cloudflare.stream.webhooks
		.get({
			account_id: env.CLOUDFLARE_ACCOUNT_ID,
		})
		.then((response) => response as WebhookResponse)
		.catch((err) => {
			if (err instanceof NotFoundError) {
				return null;
			}

			console.error('Error fetching webhooks:', err);
			return null;
		});

	return response;
};

export const createWebhook = async (url: string): Promise<WebhookResponse | null> => {
	const response = await cloudflare.stream.webhooks
		.update({
			account_id: env.CLOUDFLARE_ACCOUNT_ID,
			notificationUrl: url,
		})
		.then((response) => response as WebhookResponse)
		.catch((err) => {
			console.error('Error updating webhooks:', err);
			return null;
		});

	return response;
};
