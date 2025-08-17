import { prisma } from '$lib/server/db/client';
import { auth } from '$src/lib/server/auth';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, depends }) => {
	const result = await auth.api.hasPermission({
		headers: request.headers,
		body: {
			permissions: {
				blocks: ['read'],
			},
		},
	});
	if (!result.success) {
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
			orderBy: {
				start: 'asc',
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
