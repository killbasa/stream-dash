import { auth } from '$src/lib/server/auth';
import { getOrgIdFromSlug } from '$src/lib/server/utils';
import { prisma } from '$src/lib/server/db/client';
import { error, fail } from '@sveltejs/kit';
import z from 'zod';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, params, depends }) => {
	const orgId = await getOrgIdFromSlug(params.orgSlug);
	if (!orgId) {
		error(404, 'Organization not found');
	}

	const hasPermission = await auth.api.hasPermission({
		headers: request.headers,
		body: {
			// https://github.com/better-auth/better-auth/pull/3329
			// organizationSlug: params.orgSlug,
			organizationId: orgId,
			permissions: {
				members: ['read'],
			},
		},
	});
	if (!hasPermission.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const [members] = await Promise.all([
		auth.api.listMembers({
			query: {
				organizationId: orgId,
			},
			headers: request.headers,
		}),
	]);

	depends('api:members');

	return {
		members,
	};
};

const AddMemberBody = z.object({
	email: z.email(),
	role: z.enum(['admin', 'member', 'editor']),
});

export const actions: Actions = {
	add: async ({ request, params }) => {
		const orgId = await getOrgIdFromSlug(params.orgSlug);
		if (!orgId) {
			error(404, 'Organization not found');
		}

		const result = await auth.api.hasPermission({
			headers: request.headers,
			body: {
				// https://github.com/better-auth/better-auth/pull/3329
				// organizationSlug: params.orgSlug,
				organizationId: orgId,
				permissions: {
					locations: ['create'],
				},
			},
		});
		if (!result.success) {
			error(403, 'Forbidden: You do not have permission to access this resource.');
		}

		const formData = await request.formData();

		const data = AddMemberBody.safeParse({
			email: formData.get('member_email'),
		});

		if (!data.success) {
			console.error('Failed to parse location data:', data.error);
			return fail(400, { message: 'Invalid request body' });
		}

		const user = await prisma.user.findUniqueOrThrow({
			where: {
				email: data.data.email,
			},
			select: {
				id: true,
			},
		});

		await auth.api.addMember({
			body: {
				userId: user.id,
				role: data.data.role,
				organizationId: orgId,
			},
		});

		return { message: 'Location created' };
	},
};
