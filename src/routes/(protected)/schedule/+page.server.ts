import { hasPermission } from '$lib/server/utils';
import { AuthScopes } from '$lib/client/constants';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (!hasPermission(locals.user, ['admin', 'user'], AuthScopes.BlocksRead)) {
		error(403, 'Forbidden: You do not have permission to access this resource.');
	}

	return {};
};
