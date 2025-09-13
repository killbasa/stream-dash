import { prisma } from '$lib/server/db/client';
import { auth } from '$src/lib/server/auth';
import { error, fail } from '@sveltejs/kit';
import z from 'zod';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, depends }) => {
	const hasPermission = await auth.api.userHasPermission({
		headers: request.headers,
		body: {
			permissions: {
				locations: ['read'],
			},
		},
	});
	if (!hasPermission.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const locations = await prisma.location.findMany({
		orderBy: {
			createdAt: 'desc',
		},
	});

	depends('api:locations');

	return {
		locations,
	};
};

const LocationPostBody = z.object({
	name: z.string().min(3),
	description: z.string().optional(),
});

export const actions: Actions = {
	create: async ({ request }) => {
		const hasPermission = await auth.api.userHasPermission({
			headers: request.headers,
			body: {
				permissions: {
					locations: ['create'],
				},
			},
		});
		if (!hasPermission.success) {
			error(403, 'Forbidden: You do not have permission to access this resource.');
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
