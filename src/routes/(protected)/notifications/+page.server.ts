import { prisma } from '$lib/server/db/client';
import { auth } from '$src/lib/server/auth';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, depends }) => {
	const hasPermission = await auth.api.userHasPermission({
		headers: request.headers,
		body: {
			permissions: {
				notifications: ['read'],
			},
		},
	});
	if (!hasPermission.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const webhook = await prisma.webhook.findFirst({
		where: {},
	});

	depends('api:webhook');

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
