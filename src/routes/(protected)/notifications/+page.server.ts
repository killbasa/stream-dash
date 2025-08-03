import { hasPermission } from '$lib/server/utils';
import { cloudflare } from '$lib/server/cloudflare/client';
import { prisma } from '$lib/server/db/client';
import { createWebhook } from '$lib/server/cloudflare/webhooks';
import { error, fail } from '@sveltejs/kit';
import z from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ locals, depends }) => {
	if (!hasPermission(locals.user, ['admin'])) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	depends('api:webhook');

	const webhook = await prisma.webhook.findUnique({
		where: {
			accountId: env.CLOUDFLARE_ACCOUNT_ID,
		},
	});

	return {
		webhook,
	};
};

const WebhookPutBody = z.object({
	notificationUrl: z
		.string()
		.nullable()
		.transform((val) => {
			if (val === '') return null;
			return val;
		}),
});

const WebhookUrlSchema = z.url();

export const actions: Actions = {
	update: async ({ request, locals }) => {
		if (!hasPermission(locals.user, ['admin'])) {
			error(403, 'Forbidden: You do not have permission to create blocks.');
		}

		const formData = await request.formData();

		const data = WebhookPutBody.safeParse({
			notificationUrl: formData.get('webhook_url')?.toString() ?? null,
		});

		if (!data.success) {
			return fail(400, {
				errors: data.error.issues.map((issue) => ({
					path: issue.path,
					message: issue.message,
				})),
			});
		}

		if (data.data.notificationUrl === null || data.data.notificationUrl.trim() === '') {
			await prisma.$transaction(async (tx) => {
				await cloudflare.stream.webhooks.delete({
					account_id: env.CLOUDFLARE_ACCOUNT_ID,
				});

				await tx.webhook.delete({
					where: {
						accountId: env.CLOUDFLARE_ACCOUNT_ID,
					},
				});
			});

			return { status: 204 };
		}

		const urlValidation = WebhookUrlSchema.safeParse(data.data.notificationUrl);

		if (!urlValidation.success) {
			return fail(400, {
				errors: urlValidation.error.issues.map((issue) => ({
					path: issue.path,
					message: issue.message,
				})),
			});
		}

		await prisma.$transaction(async (tx) => {
			const webhook = await createWebhook(urlValidation.data);

			if (!webhook) {
				return fail(500, { message: 'Failed to create webhook.' });
			}

			await tx.webhook.create({
				data: {
					accountId: env.CLOUDFLARE_ACCOUNT_ID,
					notificationUrl: webhook.notificationUrl,
					secret: webhook.secret,
				},
			});
		});

		return { status: 201 };
	},
};
