import { ok } from '$lib/server/api';
import { prisma } from '$lib/server/db/client';
import { hasPermission } from '$src/lib/server/utils';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!hasPermission(locals.user, ['locations/edit'])) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	await prisma.$transaction(async (tx) => {
		const count = await tx.block.count({
			where: { locationId: params.id },
		});

		if (count > 0) {
			throw new Error('Location has associated blocks and cannot be deleted.');
		}

		await prisma.location.delete({
			where: { id: params.id },
		});
	});

	return ok(204);
};
