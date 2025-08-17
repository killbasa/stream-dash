import { prisma } from '$lib/server/db/client';
import { auth } from '$src/lib/server/auth';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ request, depends }) => {
	const result = await auth.api.hasPermission({
		headers: request.headers,
		body: {
			permissions: {
				notifications: ['read'],
			},
		},
	});
	if (!result.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	depends('api:webhook');

	const webhook = await prisma.webhook.findUnique({
		where: {
			accountId: env.CLOUDFLARE_ACCOUNT_ID!,
		},
	});

	return {
		webhook,
	};
};

// const WebhookPutBody = z.object({
// 	notificationUrl: z
// 		.string()
// 		.nullable()
// 		.transform((val) => {
// 			if (val === '') return null;
// 			return val;
// 		}),
// });

// const WebhookUrlSchema = z.url();

export const actions: Actions = {
	update: () => {
		return { status: 204 };
	},
};
