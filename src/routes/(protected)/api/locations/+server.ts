import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { json } from '@sveltejs/kit';
import z from 'zod';
import type { RequestHandler } from './$types';

const LocationPostBody = z.object({
	name: z.string().min(3),
	description: z.string().optional(),
});

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!hasPermission(locals.user, ['admin', 'editor'], 'locations')) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const data = LocationPostBody.safeParse(await request.json());
	if (!data.success) {
		return json(
			{ message: 'Invalid request body', errors: data.error.issues },
			{ status: 400 },
		);
	}

	const result = await prisma.location.create({
		data: {
			name: data.data.name,
			description: data.data.description,
		},
	});

	return json(result, { status: 201 });
};
