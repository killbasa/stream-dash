import { hasPermission } from '$lib/server/utils';
import { prisma } from '$lib/server/db/client';
import { AuthScopes } from '$lib/client/constants';
import { cloudflare } from '$lib/server/cloudflare/client';
import { error, fail } from '@sveltejs/kit';
import z from 'zod';
import type { Actions, PageServerLoad } from './$types';
import type { Image } from 'cloudflare/resources/images.mjs';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ locals, depends }) => {
	if (!hasPermission(locals.user, ['admin', 'user'], AuthScopes.TalentsRead)) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	depends('api:talents');

	const talents = await prisma.talent.findMany();

	return {
		talents,
	};
};

const TalentPostBody = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
});

export const actions: Actions = {
	create: async ({ locals, request }) => {
		if (!hasPermission(locals.user, ['admin', 'user'], AuthScopes.TalentsEdit)) {
			error(403, 'Forbidden: You do not have permission to create talents.');
		}

		const formData = await request.formData();

		const data = TalentPostBody.safeParse({
			name: formData.get('talent_name'),
			description: formData.get('talent_description'),
		});
		if (!data.success) {
			console.error('Failed to parse talent data:', data.error);
			return fail(400, { message: 'Invalid request body' });
		}

		let image = formData.get('talent_image');
		if (image instanceof File && image.size === 0) {
			image = null;
		}

		if (image) {
			if (!(image instanceof File)) {
				return fail(400, { message: 'Image is required' });
			}

			if (image.size > 1024 * 1024) {
				return fail(400, { message: 'File size exceeds 1MB limit.' });
			}
		}

		await prisma.$transaction(async (tx) => {
			let response: Image | undefined;
			if (image instanceof File) {
				response = await cloudflare.images.v1.create({
					account_id: env.CLOUDFLARE_ACCOUNT_ID,
					file: image,
				});
			}

			return await tx.talent.create({
				data: {
					name: data.data.name,
					description: data.data.description,
					imageId: response?.id,
					imageUrl: response?.variants?.[0],
				},
			});
		});

		return { message: 'Talent created' };
	},
};
