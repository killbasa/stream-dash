import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { error } from '@sveltejs/kit';
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
	update: ({ locals }) => {
		if (!hasPermission(locals.user, ['admin'])) {
			error(403, 'Forbidden: You do not have permission to edit notifications.');
		}

		return { status: 204 };
	},
};
