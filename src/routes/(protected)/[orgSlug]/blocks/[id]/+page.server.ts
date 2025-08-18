import { prisma } from '$lib/server/db/client';
import { auth } from '$src/lib/server/auth';
import { getOrgIdFromSlug } from '$src/lib/server/utils';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { LiveInput } from '$lib/server/db/generated/client';

export const load: PageServerLoad = async ({ request, params }) => {
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
				blocks: ['read'],
			},
		},
	});
	if (!result.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const block = await prisma.block.findUnique({
		where: {
			id: params.id,
			organizationId: orgId,
		},
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
		prisma.liveInput.findMany({
			where: {
				organizationId: orgId,
			},
		}),
		prisma.talent.findMany({
			where: {
				organizationId: orgId,
			},
		}),
		prisma.location.findMany({
			where: {
				organizationId: orgId,
			},
		}),
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
