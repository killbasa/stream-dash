import { prisma } from '$lib/server/db/client';
import { auth } from '$src/lib/server/auth';
import { getOrgIdFromSlug } from '$src/lib/server/utils';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, depends, params }) => {
	const orgId = await getOrgIdFromSlug(params.orgSlug);
	if (!orgId) {
		error(404, 'Organization not found');
	}

	const result = await auth.api.hasPermission({
		headers: request.headers,
		body: {
			// https://github.com/better-auth/better-auth/pull/3329
			// organizationSlug: params.orgSlug,
			organizationId: orgId,
			permissions: {
				notifications: ['read'],
			},
		},
	});
	if (!result.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const webhook = await prisma.webhook.findFirst({
		where: {
			organizationId: orgId,
		},
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
