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
				blocks: ['read'],
			},
		},
	});
	if (!result.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const [liveInputs, talents, locations, blocks] = await prisma.$transaction([
		prisma.liveInput.findMany({
			where: {
				organizationId: orgId,
			},
		}),
		prisma.talent.findMany({
			where: {
				organizationId: orgId,
			},
		}),
		prisma.location.findMany({
			where: {
				organizationId: orgId,
			},
		}),
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
			orderBy: {
				start: 'asc',
			},
		}),
	]);

	depends('api:blocks');

	return {
		liveInputs,
		talents,
		locations,
		blocks,
	};
};
