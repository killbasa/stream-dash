import { prisma } from '$lib/server/db/client';
import { hasPermission } from '$lib/server/utils';
import { AuthRoles } from '$lib/client/constants';
import { error, fail } from '@sveltejs/kit';
import z from 'zod';
import type { Actions, PageServerLoad } from './$types';

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

const WhitelistPostBody = z.object({
	email: z.email(),
	defaultRole: z.enum(AuthRoles).optional(),
});

export const actions: Actions = {
	whitelistCreate: async ({ request, locals }) => {
		if (!hasPermission(locals.user, ['admin'])) {
			error(403, 'Forbidden: You do not have permission to create whitelist entries.');
		}

		const formData = await request.formData();

		const data = WhitelistPostBody.safeParse({
			email: formData.get('whitelist_email'),
			defaultRole: formData.get('whitelist_role'),
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
			},
		});

		return { message: 'Whitelist entry created' };
	},
};
