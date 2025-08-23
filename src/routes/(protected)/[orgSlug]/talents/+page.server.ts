import { prisma } from '$lib/server/db/client';
import { auth } from '$src/lib/server/auth';
import { getOrgIdFromSlug } from '$src/lib/server/utils';
import { getCloudflareServiceAccount } from '$src/lib/server/cloudflare/service-account';
import { error, fail } from '@sveltejs/kit';
import z from 'zod';
import type { Actions, PageServerLoad } from './$types';
import type { Image } from 'cloudflare/resources/images.mjs';

export const load: PageServerLoad = async ({ request, depends, params }) => {
	const orgId = await getOrgIdFromSlug(params.orgSlug);
	if (!orgId) {
		error(404, 'Organization not found');
	}

	const result = await auth.api.hasPermission({
		headers: request.headers,
		body: {
			// https://github.com/better-auth/better-auth/pull/3329
			// organizationSlug: params.orgSlug,
			organizationId: orgId,
			permissions: {
				talents: ['read'],
			},
		},
	});

	if (!result.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const talents = await prisma.talent.findMany({
		where: {
			organizationId: orgId,
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	depends('api:talents');

	return {
		talents,
	};
};

const TalentPostBody = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
});

export const actions: Actions = {
	create: async ({ request, params }) => {
		const orgId = await getOrgIdFromSlug(params.orgSlug);
		if (!orgId) {
			error(404, 'Organization not found');
		}

		const result = await auth.api.hasPermission({
			headers: request.headers,
			body: {
				// https://github.com/better-auth/better-auth/pull/3329
				// organizationSlug: params.orgSlug,
				organizationId: orgId,
				permissions: {
					talents: ['create'],
				},
			},
		});
		if (!result.success) {
			error(403, 'Forbidden: You do not have permission to access this resource.');
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

		const { cloudflare, accountId } = getCloudflareServiceAccount();

		await prisma.$transaction(async (tx) => {
			let response: Image | undefined;
			if (image instanceof File) {
				response = await cloudflare.images.v1.create({
					account_id: accountId,
					file: image,
				});
			}

			return await tx.talent.create({
				data: {
					name: data.data.name,
					description: data.data.description,
					imageId: response?.id,
					imageUrl: response?.variants?.[0],
					organizationId: orgId,
				},
			});
		});

		return { message: 'Talent created' };
	},
};
