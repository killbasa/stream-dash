import type { Session } from '$lib/client/auth';
import type { AuthMemberScope } from '../client/constants';

export const hasPermission = (user: Session['user'] | undefined, scopes: AuthMemberScope[]) => {
	if (!user) return false;
	if (!user.role) return false;

	if (user.role === 'admin') return true;

	if (scopes.some((scope) => hasScope(user, scope))) {
		return true;
	}

	return false;
};

const hasScope = (user: Session['user'], scope: AuthMemberScope) => {
	if (!user.scopes) return false;

	return user.scopes.includes(scope);
};
