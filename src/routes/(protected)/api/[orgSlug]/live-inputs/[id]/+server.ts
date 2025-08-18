import { ok } from '$lib/server/api';
import { prisma } from '$lib/server/db/client';
import { LiveInputType } from '$lib/server/db/generated/client';
import { auth } from '$src/lib/server/auth';
import { getOrgIdFromSlug } from '$src/lib/server/utils';
import { getCloudflareClient } from '$src/lib/server/cloudflare/client';
import { json } from '@sveltejs/kit';
import z from 'zod';
import type { RequestHandler } from './$types';

const LiveInputPutBody = z.object({
	type: z.enum([LiveInputType.ingest, LiveInputType.return]),
});

export const PUT: RequestHandler = async ({ params, request }) => {
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
				liveinputs: ['update'],
			},
		},
	});
	if (!hasPermission.success) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const data = LiveInputPutBody.safeParse(await request.json());
	if (!data.success) {
		return json(
			{ message: 'Invalid request body', errors: data.error.issues },
			{ status: 400 },
		);
	}

	const liveInput = await prisma.liveInput.update({
		where: {
			id: params.id,
		},
		data: {
			type: data.data.type,
		},
	});

	return json(liveInput);
};

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
			permissions: {
				liveinputs: ['delete'],
			},
		},
	});
	if (!hasPermission.success) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const { cloudflare, accountId } = await getCloudflareClient(orgId);

	await prisma.$transaction(async (tx) => {
		const liveInput = await tx.liveInput.findUniqueOrThrow({
			where: { id: params.id },
			select: {
				cloudflareId: true,
				ingestFor: true,
				playbackFor: true,
			},
		});

		if (liveInput.ingestFor.length > 0 || liveInput.playbackFor.length > 0) {
			throw new Error('Live input has associated blocks and cannot be deleted.');
		}

		await cloudflare.stream.liveInputs.delete(liveInput.cloudflareId, {
			account_id: accountId,
		});

		await tx.liveInput.delete({
			where: { id: params.id },
		});
	});

	return ok(204);
};
