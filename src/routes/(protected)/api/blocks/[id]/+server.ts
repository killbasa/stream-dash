import { ok } from '$lib/server/api';
import { prisma } from '$lib/server/db/client';
import { hasPermission } from '$src/lib/server/utils';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!hasPermission(locals.user, ['blocks/edit'])) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	await prisma.block.delete({
		where: { id: params.id },
	});

	return ok(204);
};
