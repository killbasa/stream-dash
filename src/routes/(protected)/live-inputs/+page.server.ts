import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { LiveInput } from '$lib/server/db/generated/client';

export const load: PageServerLoad = async ({ locals, depends }) => {
	if (!hasPermission(locals.user, ['admin', 'user'], 'live-inputs-read')) {
		throw error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	depends('api:live-inputs');

	const liveInputs = await prisma.liveInput.findMany();

	const validLiveInputs: LiveInput[] = [];
	const pendingLiveInputs: LiveInput[] = [];
	for (const liveInput of liveInputs) {
		if (liveInput.type) {
			validLiveInputs.push(liveInput);
		} else {
			pendingLiveInputs.push(liveInput);
		}
	}

	return {
		liveInputs: validLiveInputs,
		pendingLiveInputs,
	};
};
