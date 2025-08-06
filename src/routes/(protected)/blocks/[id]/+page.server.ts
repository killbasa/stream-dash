import { prisma } from '$lib/server/db/client';
import { hasPermission } from '$lib/server/utils';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { LiveInput } from '$lib/server/db/generated/client';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!hasPermission(locals.user, ['admin', 'user'], 'blocks-read')) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const block = await prisma.block.findUnique({
		where: { id: params.id },
		include: {
			talents: true,
			location: true,
			ingestLiveInput: true,
			playbackLiveInput: true,
		},
	});

	if (!block) {
		error(404, 'Block not found');
	}

	const [liveInputs, talents, locations] = await prisma.$transaction([
		prisma.liveInput.findMany(),
		prisma.talent.findMany(),
		prisma.location.findMany(),
	]);

	const ingests: LiveInput[] = [];
	const playbacks: LiveInput[] = [];
	for (const input of liveInputs) {
		if (input.type === 'ingest') {
			ingests.push(input);
		} else if (input.type === 'return') {
			playbacks.push(input);
		}
	}

	return {
		block,
		ingestLiveInputs: ingests,
		returnLiveInputs: playbacks,
		talents,
		locations,
	};
};
