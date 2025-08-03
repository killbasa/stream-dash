import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, depends }) => {
	if (!hasPermission(locals.user, ['editor', 'reader'], 'talents')) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const talent = await prisma.talent.findUnique({
		where: { id: params.id },
	});

	if (!talent) {
		error(404, 'Talent not found');
	}

	depends('api:talents');

	return {
		talent,
	};
};
