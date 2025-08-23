import { ok } from '$lib/server/api';
import { prisma } from '$lib/server/db/client';
import { auth } from '$src/lib/server/auth';
import { getOrgIdFromSlug } from '$src/lib/server/utils';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params, request }) => {
	const orgId = await getOrgIdFromSlug(params.orgSlug);
	if (!orgId) {
		return json({ message: 'Organization not found' }, { status: 404 });
	}

	const hasPermission = await auth.api.hasPermission({
		headers: request.headers,
		body: {
			// https://github.com/better-auth/better-auth/pull/3329
			// organizationSlug: params.orgSlug,
			organizationId: orgId,
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
