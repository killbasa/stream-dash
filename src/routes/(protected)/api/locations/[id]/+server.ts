import { ok } from '$lib/server/api';
import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!hasPermission(locals.user, ['admin', 'user'], 'locations-edit')) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	await prisma.location.delete({
		where: { id: params.id },
	});

	await prisma.$transaction(async (tx) => {
		const location = await tx.location.findUniqueOrThrow({
			where: { id: params.id },
			include: {
				blocks: true,
			},
		});

		if (location.blocks.length > 0) {
			throw new Error('Location has associated blocks and cannot be deleted.');
		}

		await prisma.location.delete({
			where: { id: params.id },
		});
	});

	return ok(204);
};
