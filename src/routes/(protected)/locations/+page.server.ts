import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { AuthScopes } from '$lib/client/constants';
import { error, fail } from '@sveltejs/kit';
import z from 'zod';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends }) => {
	if (!hasPermission(locals.user, ['admin', 'user'], AuthScopes.LocationsRead)) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	depends('api:locations');

	const locations = await prisma.location.findMany({
		orderBy: {
			createdAt: 'desc',
		},
	});

	return {
		locations,
	};
};

const LocationPostBody = z.object({
	name: z.string().min(3),
	description: z.string().optional(),
});

export const actions: Actions = {
	create: async ({ locals, request }) => {
		if (!hasPermission(locals.user, ['admin', 'user'], AuthScopes.LocationsEdit)) {
			error(403, 'Forbidden: You do not have permission to create locations.');
		}

		const formData = await request.formData();

		const data = LocationPostBody.safeParse({
			name: formData.get('location_name'),
			description: formData.get('location_description'),
		});

		if (!data.success) {
			console.error('Failed to parse location data:', data.error);
			return fail(400, { message: 'Invalid request body' });
		}

		await prisma.location.create({
			data: {
				name: data.data.name,
				description: data.data.description,
			},
		});

		return { message: 'Location created' };
	},
};
