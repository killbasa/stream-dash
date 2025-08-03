import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends }) => {
	if (!hasPermission(locals.user, ['editor', 'reader'], 'locations')) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	depends('api:locations');

	const locations = await prisma.location.findMany();

	return {
		locations,
	};
};
