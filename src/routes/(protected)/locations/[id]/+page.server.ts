import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { AuthScopes } from '$lib/client/constants';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, depends }) => {
	if (!hasPermission(locals.user, ['admin', 'user'], AuthScopes.LocationsRead)) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const location = await prisma.location.findUnique({
		where: { id: params.id },
	});

	if (!location) {
		error(404, 'Location not found');
	}

	depends('api:locations');

	return {
		location,
	};
};
