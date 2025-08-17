import { prisma } from '$lib/server/db/client';
import { AuthInstanceRoles, AuthMemberScopes } from '$lib/client/constants';
import { auth } from '$src/lib/server/auth';
import { error, fail } from '@sveltejs/kit';
import z from 'zod';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, depends }) => {
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

	const [users, whitelists] = await Promise.all([
		auth.api.listUsers({
			query: {},
			headers: request.headers,
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

const WhitelistPostBody = z.object({
	email: z.email(),
	defaultRole: z.enum(AuthInstanceRoles).optional(),
	defaultScopes: z.array(z.enum(AuthMemberScopes)).optional(),
});

export const actions: Actions = {
	whitelistCreate: async ({ request }) => {
		const hasPermission = await auth.api.userHasPermission({
			headers: request.headers,
			body: {
				permissions: {
					whitelists: ['create'],
				},
			},
		});
		if (!hasPermission.success) {
			error(403, 'Forbidden: You do not have permission to access this resource.');
		}

		const formData = await request.formData();

		const data = WhitelistPostBody.safeParse({
			email: formData.get('whitelist_email'),
			defaultRole: formData.get('whitelist_role'),
			defaultScopes: formData.getAll('whitelist_scopes'),
		});

		if (!data.success) {
			console.error('Failed to parse whitelist data:', data.error);
			return fail(400, { message: 'Invalid request body' });
		}

		if (data.data.defaultRole === 'superadmin') {
			return fail(400, { message: 'Cannot set default role to admin' });
		}

		await prisma.whitelist.create({
			data: {
				email: data.data.email,
				defaultRole: data.data.defaultRole,
				defaultScopes: data.data.defaultScopes,
			},
		});

		return { message: 'Whitelist entry created' };
	},
	whitelistRevoke: async ({ request }) => {
		const hasPermission = await auth.api.userHasPermission({
			headers: request.headers,
			body: {
				permissions: {
					whitelists: ['delete'],
				},
			},
		});
		if (!hasPermission.success) {
			error(403, 'Forbidden: You do not have permission to access this resource.');
		}

		const formData = await request.formData();

		const entryId = formData.get('whitelist_id');
		if (typeof entryId !== 'string') {
			return fail(400, { message: 'Invalid whitelist ID' });
		}

		await prisma.whitelist.delete({
			where: { id: entryId },
		});

		return { message: 'Whitelist entry deleted' };
	},
};
