import { prisma } from '$src/lib/server/db/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

function getCustomerId(url: string): string | null {
	const parts = url.split('.');
	const customerId = parts.at(0)?.substring(8);
	return customerId ?? null;
}

export const load: PageServerLoad = async ({ params }) => {
	if (params.id.length !== 36) {
		error(404, 'Live input not found');
	}

	const liveInput = await prisma.liveInput.findUnique({
		where: {
			id: params.id,
		},
	});

	if (!liveInput) {
		error(404, 'Live input not found');
	}

	return {
		name: liveInput.name,
		id: liveInput.cloudflareId,
		customerId: getCustomerId(liveInput.playbackWebrtcUrl),
	};
};
