import { auth } from '$src/lib/server/auth';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, depends, params }) => {
	const hasPermission = await auth.api.userHasPermission({
		headers: request.headers,
		body: {
			permissions: {
				user: ['list'],
			},
		},
	});
	if (!hasPermission.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	depends('api:users');

	const users = await auth.api.listUsers({
		query: {
			limit: 1,
			filterField: 'id',
			filterValue: params.id,
			filterOperator: 'eq',
		},
		headers: request.headers,
	});

	if (users.total === 0) {
		error(404, 'User not found');
	}

	return {
		user: users.users[0],
	};
};
