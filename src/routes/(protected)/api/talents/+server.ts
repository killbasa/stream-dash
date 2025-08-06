import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { cloudflare } from '$lib/server/cloudflare/client';
import { json } from '@sveltejs/kit';
import z from 'zod';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const TalentPostBody = z.object({
	name: z.string().min(3),
	description: z.string().optional(),
});

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!hasPermission(locals.user, ['admin', 'user'], 'talents-edit')) {
		return json({ message: 'Unauthorized' }, { status: 403 });
	}

	const formData = await request.formData();

	const data = TalentPostBody.safeParse({
		name: formData.get('talent_name'),
		description: formData.get('talent_description'),
	});
	if (!data.success) {
		return json(
			{ message: 'Invalid request body', errors: data.error.issues },
			{ status: 400 },
		);
	}

	const image = formData.get('talent_image');

	if (!image || !(image instanceof File)) {
		return json({ message: 'Image is required' }, { status: 400 });
	}

	if (image.size > 1024 * 1024) {
		return json({ message: 'File size exceeds 1MB limit.' }, { status: 400 });
	}

	const result = await prisma.$transaction(async (tx) => {
		const response = await cloudflare.images.v1.create({
			account_id: env.CLOUDFLARE_ACCOUNT_ID,
			file: image,
		});

		return await tx.talent.create({
			data: {
				name: data.data.name,
				description: data.data.description,
				imageId: response.id,
				imageUrl: response.variants?.[0],
			},
		});
	});

	return json(result, { status: 201 });
};
