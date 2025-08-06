import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends }) => {
	if (!hasPermission(locals.user, ['admin', 'user'], 'talents-read')) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	depends('api:talents');

	const talents = await prisma.talent.findMany();

	return {
		talents,
	};
};
