import { prisma } from '$lib/server/db/client';
import { hasPermission } from '$src/lib/server/utils';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends, params }) => {
	if (!hasPermission(locals.user, ['talents/read'])) {
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
