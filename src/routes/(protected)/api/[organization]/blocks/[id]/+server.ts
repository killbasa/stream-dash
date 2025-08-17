import { ok } from '$lib/server/api';
import { prisma } from '$lib/server/db/client';
import { auth } from '$src/lib/server/auth';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params, request }) => {
	const hasPermission = await auth.api.hasPermission({
		headers: request.headers,
		body: {
			permissions: {
				blocks: ['delete'],
			},
		},
	});
	if (!hasPermission.success) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	await prisma.block.delete({
		where: { id: params.id },
	});

	return ok(204);
};
