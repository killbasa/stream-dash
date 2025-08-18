import { auth } from '$src/lib/server/auth';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, params }) => {
	const hasPermission = await auth.api.userHasPermission({
		headers: request.headers,
		body: {
			permissions: {
				organizations: ['read'],
			},
		},
	});
	if (!hasPermission.success) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	const [organization] = await Promise.all([
		auth.api.getFullOrganization({
			query: {
				organizationId: params.id,
			},
			headers: request.headers,
		}),
	]);

	if (!organization) {
		error(404, 'Organization not found');
	}

	return {
		organization,
	};
};
