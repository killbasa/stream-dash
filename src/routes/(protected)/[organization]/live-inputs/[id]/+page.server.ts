import { prisma } from '$lib/server/db/client';
import { auth } from '$src/lib/server/auth';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, params, depends }) => {
	const result = await auth.api.hasPermission({
		headers: request.headers,
		body: {
			permissions: {
				liveinputs: ['read'],
			},
		},
	});
	if (!result.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const liveInput = await prisma.liveInput.findUnique({
		where: { id: params.id },
	});

	if (!liveInput) {
		error(404, 'Live Input not found');
	}

	depends('api:live-inputs');

	return {
		liveInput,
	};
};
