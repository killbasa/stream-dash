import { prisma } from '$lib/server/db/client';
import { hasPermission } from '$src/lib/server/utils';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, depends }) => {
	if (!hasPermission(locals.user, ['locations/read'])) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const location = await prisma.location.findUnique({
		where: {
			id: params.id,
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
