import { prisma } from '$lib/server/db/client';
import { auth } from '$src/lib/server/auth';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, params, depends }) => {
	const hasPermission = await auth.api.userHasPermission({
		headers: request.headers,
		body: {
			permissions: {
				locations: ['read'],
			},
		},
	});
	if (!hasPermission.success) {
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
