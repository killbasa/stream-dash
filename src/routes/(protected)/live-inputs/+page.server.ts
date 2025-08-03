import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends }) => {
	if (!hasPermission(locals.user, ['editor', 'reader'], 'live-inputs')) {
		throw error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	depends('api:live-inputs');

	const liveInputs = await prisma.liveInput.findMany();

	return {
		liveInputs,
	};
};
