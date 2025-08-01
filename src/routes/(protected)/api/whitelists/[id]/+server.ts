import { prisma } from '$lib/server/db/client';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async (event) => {
	if (event.locals.user?.role !== 'admin') {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const whitelistId = event.params.id;
	const whitelist = await prisma.whitelist.findUnique({
		where: { id: whitelistId },
	});

	if (!whitelist) {
		return json({ message: 'Whitelist not found' }, { status: 404 });
	}

	await prisma.whitelist.delete({
		where: { id: whitelist.id },
	});

	return json({ message: 'User deleted successfully' });
};
