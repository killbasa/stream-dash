import { ok } from '$lib/server/api';
import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!hasPermission(locals.user, ['admin', 'user'], 'blocks-edit')) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	await prisma.block.delete({
		where: { id: params.id },
	});

	return ok(204);
};
