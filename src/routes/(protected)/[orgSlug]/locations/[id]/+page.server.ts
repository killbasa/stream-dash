import { prisma } from '$lib/server/db/client';
import { auth } from '$src/lib/server/auth';
import { getOrgIdFromSlug } from '$src/lib/server/utils';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, params, depends }) => {
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
				locations: ['read'],
			},
		},
	});
	if (!result.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const location = await prisma.location.findUnique({
		where: {
			id: params.id,
			organizationId: orgId,
		},
	});

	if (!location) {
		error(404, 'Location not found');
	}

	depends('api:locations');

	return {
		location,
	};
};
