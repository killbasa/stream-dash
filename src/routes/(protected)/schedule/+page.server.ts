import { prisma } from '$lib/server/db/client';
import { hasPermission } from '$lib/server/utils';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!hasPermission(locals.user, ['reader'])) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const [blocks] = await prisma.$transaction([
		prisma.block.findMany({
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
