import { prisma } from '$lib/server/db/client';
import { auth } from '$src/lib/server/auth';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, depends, params }) => {
	const result = await auth.api.hasPermission({
		headers: request.headers,
		body: {
			permissions: {
				members: ['read'],
			},
		},
	});
	if (!result.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	depends('api:users');

	const [members] = await prisma.$transaction([
		prisma.member.findMany({
			where: {
				organizationId: params.organization,
			},
			include: {
				user: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		}),
	]);

	return {
		members,
	};
};
