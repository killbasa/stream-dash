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

	const sessions = await auth.api.listUserSessions({
		body: {
			userId: params.id,
		},
		headers: request.headers,
	});

	depends('api:users');

	return {
		user: users.users[0],
		sessions,
	};
};
