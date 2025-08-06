import { ok } from '$lib/server/api';
import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { cloudflare } from '$lib/server/cloudflare/client';
import { AuthScopes } from '$lib/client/constants';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const PUT: RequestHandler = async ({ locals, params, request }) => {
	if (!hasPermission(locals.user, ['admin', 'user'], AuthScopes.TalentsEdit)) {
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

	const result = await prisma.$transaction(async (tx) => {
		const talent = await tx.talent.findUniqueOrThrow({
			where: { id: params.id },
		});

		if (talent.imageId) {
			await cloudflare.images.v1.delete(talent.imageId, {
				account_id: env.CLOUDFLARE_ACCOUNT_ID,
			});
		}

		const response = await cloudflare.images.v1.create({
			account_id: env.CLOUDFLARE_ACCOUNT_ID,
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

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!hasPermission(locals.user, ['admin', 'user'], AuthScopes.TalentsEdit)) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

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
				account_id: env.CLOUDFLARE_ACCOUNT_ID,
			});
		}

		await prisma.talent.delete({
			where: { id: params.id },
		});
	});

	return ok(204);
};
