import { getOrgIdFromSlug } from '$src/lib/server/utils';
import { auth } from '$src/lib/server/auth';
import { prisma } from '$src/lib/server/db/client';
import { error, fail } from '@sveltejs/kit';
import z from 'zod';
import type { PageServerLoad, Actions } from './$types';

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
				cloudflare: ['update'],
			},
		},
	});
	if (!result.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	depends('api:cloudflare');

	const cfCredentials = await prisma.cloudflareCredentials.findUnique({
		where: {
			organizationId: orgId,
		},
	});

	return {
		cfCredentials,
	};
};

const UpdateActionSchema = z.object({
	accountId: z.string(),
	apiToken: z.string(),
	webhookSecret: z.string(),
});

export const actions: Actions = {
	update: async ({ request, params }) => {
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
					cloudflare: ['update'],
				},
			},
		});
		if (!result.success) {
			error(403, 'Forbidden: You do not have permission to access this resource.');
		}

		const formData = await request.formData();

		const data = UpdateActionSchema.safeParse({
			accountId: formData.get('cf_accountid'),
			apiToken: formData.get('cf_apitoken'),
			webhookSecret: formData.get('cf_webhooksecret'),
		});

		if (!data.success) {
			return fail(400, {
				errors: data.error.issues.map((issue) => ({
					path: issue.path,
					message: issue.message,
				})),
			});
		}

		await prisma.cloudflareCredentials.upsert({
			where: {
				organizationId: orgId,
			},
			update: {
				accountId: data.data.accountId,
				apiToken: data.data.apiToken,
				webhookSecret: data.data.webhookSecret,
			},
			create: {
				organizationId: orgId,
				accountId: data.data.accountId,
				apiToken: data.data.apiToken,
				webhookSecret: data.data.webhookSecret,
			},
		});

		return { message: 'Cloudflare settings updated successfully.' };
	},
};
