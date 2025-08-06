import { prisma } from '$lib/server/db/client';
import { hasPermission } from '$lib/server/utils';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends, params }) => {
	if (!hasPermission(locals.user, ['admin'])) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	depends('api:users');

	const user = await prisma.user.findUnique({
		where: { id: params.id },
	});

	if (!user) {
		error(404, 'User not found');
	}

	return {
		user,
	};
};
