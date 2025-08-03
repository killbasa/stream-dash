import { prisma } from '$lib/server/db/client';
import { hasPermission } from '$lib/server/utils';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends }) => {
	if (!hasPermission(locals.user, ['admin'])) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	depends('api:users');

	const [users, whitelists] = await prisma.$transaction([
		prisma.user.findMany({
			where: {
				role: {
					not: 'superadmin',
				},
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				scopes: true,
			},
		}),
		prisma.whitelist.findMany({
			select: {
				id: true,
				email: true,
				defaultRole: true,
			},
		}),
	]);

	return {
		users,
		whitelists,
	};
};
