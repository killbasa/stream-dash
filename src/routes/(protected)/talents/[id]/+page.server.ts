import { prisma } from '$lib/server/db/client';
import { auth } from '$src/lib/server/auth';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, depends, params }) => {
	const hasPermission = await auth.api.userHasPermission({
		headers: request.headers,
		body: {
			permissions: {
				talents: ['read'],
			},
		},
	});
	if (!hasPermission.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const talent = await prisma.talent.findUnique({
		where: {
			id: params.id,
		},
	});

	if (!talent) {
		error(404, 'Talent not found');
	}

	depends('api:talents');

	return {
		talent,
	};
};
