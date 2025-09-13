import { prisma } from '$lib/server/db/client';
import { hasPermission } from '$src/lib/server/utils';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends }) => {
	if (!hasPermission(locals.user, ['live-inputs/edit'])) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const [liveInputs, talents, locations, blocks] = await prisma.$transaction([
		prisma.liveInput.findMany(),
		prisma.talent.findMany(),
		prisma.location.findMany(),
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
