import { prisma } from '$lib/server/db/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const users = await prisma.user.findMany({
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			scopes: true,
		},
	});

	return {
		users,
	};
};
