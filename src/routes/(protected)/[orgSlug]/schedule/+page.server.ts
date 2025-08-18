import { auth } from '$src/lib/server/auth';
import { getOrgIdFromSlug } from '$src/lib/server/utils';
import { prisma } from '$src/lib/server/db/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, params }) => {
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
				blocks: ['read'],
			},
		},
	});
	if (!result.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const [blocks] = await prisma.$transaction([
		prisma.block.findMany({
			where: {
				organizationId: orgId,
			},
			include: {
				talents: {
					select: {
						id: true,
						name: true,
					},
				},
				location: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		}),
	]);

	return {
		blocks,
	};
};
