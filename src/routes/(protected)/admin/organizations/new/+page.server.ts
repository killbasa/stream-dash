import { auth } from '$src/lib/server/auth';
import { getCloudflareServiceAccount } from '$src/lib/server/cloudflare/service-account';
import z from 'zod';
import { error, fail, json } from '@sveltejs/kit';
import type { Actions } from './$types';

const OrganizationCreateSchema = z.object({
	name: z.string().min(3).max(100),
	slug: z
		.string()
		.min(3)
		.max(100)
		.transform((val) => val.replace(/\s+/g, '-').toLowerCase()),
	logo: z.file().optional(),
});

export const actions: Actions = {
	create: async ({ request }) => {
		const result = await auth.api.userHasPermission({
			headers: request.headers,
			body: {
				permissions: {
					organizations: ['create'],
				},
			},
		});
		if (!result.success) {
			error(403, 'Forbidden: You do not have permission to access this resource.');
		}

		const formData = await request.formData();

		const data = OrganizationCreateSchema.safeParse({
			name: formData.get('org_name'),
			slug: formData.get('org_slug'),
			logo: formData.get('org_logo'),
		});
		if (!data.success) {
			console.error('Failed to parse organzation data:', data.error);
			return fail(400, { message: 'Invalid request body' });
		}

		let logoUrl: string | undefined;

		if (data.data.logo) {
			if (data.data.logo.size > 1024 * 1024) {
				return json({ message: 'File size exceeds 1MB limit.' }, { status: 400 });
			}

			const { cloudflare, accountId } = getCloudflareServiceAccount();

			const response = await cloudflare.images.v1.create({
				account_id: accountId,
				file: data.data.logo,
			});

			logoUrl = response.variants?.[0];
		}

		await auth.api.createOrganization({
			body: {
				name: data.data.name,
				slug: data.data.slug,
				logo: logoUrl,
				keepCurrentActiveOrganization: true,
			},
			headers: request.headers,
		});

		return { message: 'Organization created' };
	},
};
