import { prisma } from '$lib/server/db/client';
import { hasPermission } from '$lib/server/utils';
import { AuthScopes } from '$lib/client/constants';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends }) => {
	if (!hasPermission(locals.user, ['admin', 'user'], AuthScopes.BlocksRead)) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	depends('api:blocks');

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
		}),
	]);

	return {
		liveInputs,
		talents,
		locations,
		blocks,
	};
};
