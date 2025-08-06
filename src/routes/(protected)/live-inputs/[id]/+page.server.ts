import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { AuthScopes } from '$lib/client/constants';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, depends }) => {
	if (!hasPermission(locals.user, ['admin', 'user'], AuthScopes.LiveInputsRead)) {
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
