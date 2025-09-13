import { ok } from '$lib/server/api';
import { prisma } from '$lib/server/db/client';
import { getCloudflareServiceAccount } from '$src/lib/server/cloudflare/service-account';
import { auth } from '$src/lib/server/auth';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ params, request }) => {
	const hasPermission = await auth.api.userHasPermission({
		headers: request.headers,
		body: {
			permissions: {
				talents: ['update'],
			},
		},
	});
	if (!hasPermission.success) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const data = await request.formData();
	const image = data.get('image');

	if (!image || !(image instanceof File)) {
		return json({ message: 'Image is required' }, { status: 400 });
	}

	if (image.size > 1024 * 1024) {
		return json({ message: 'File size exceeds 1MB limit.' }, { status: 400 });
	}

	const { cloudflare, accountId } = getCloudflareServiceAccount();

	const result = await prisma.$transaction(async (tx) => {
		const talent = await tx.talent.findUniqueOrThrow({
			where: { id: params.id },
		});

		if (talent.imageId) {
			await cloudflare.images.v1.delete(talent.imageId, {
				account_id: accountId,
			});
		}

		const response = await cloudflare.images.v1.create({
			account_id: accountId,
			file: image,
		});

		return await tx.talent.update({
			where: { id: params.id },
			data: {
				imageId: response.id,
				imageUrl: response.variants?.[0],
			},
		});
	});

	return json(result);
};

export const DELETE: RequestHandler = async ({ request, params }) => {
	const hasPermission = await auth.api.userHasPermission({
		headers: request.headers,
		body: {
			permissions: {
				talents: ['delete'],
			},
		},
	});
	if (!hasPermission.success) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const { cloudflare, accountId } = getCloudflareServiceAccount();

	await prisma.$transaction(async (tx) => {
		const talent = await tx.talent.findUniqueOrThrow({
			where: { id: params.id },
			include: {
				blocks: true,
			},
		});

		if (talent.blocks.length > 0) {
			throw new Error('Talent has associated blocks and cannot be deleted.');
		}

		if (talent.imageId) {
			await cloudflare.images.v1.delete(talent.imageId, {
				account_id: accountId,
			});
		}

		await prisma.talent.delete({
			where: { id: params.id },
		});
	});

	return ok(204);
};
