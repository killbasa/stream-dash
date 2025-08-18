import { prisma } from '$lib/server/db/client';
import { auth } from '$src/lib/server/auth';
import { getOrgIdFromSlug } from '$src/lib/server/utils';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

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
				talents: ['read'],
			},
		},
	});

	if (!result.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const talent = await prisma.talent.findUnique({
		where: {
			id: params.id,
			organizationId: orgId,
		},
	});

	if (!talent) {
		error(404, 'Talent not found');
	}

	depends('api:talents');

	return {
		talent,
	};
};
