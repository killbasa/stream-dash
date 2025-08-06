import type { Session } from '$lib/client/auth';
import type { AuthRole, AuthScope } from '$lib/client/constants';

export const hasPermission = (
	user: Session['user'] | undefined,
	roles: AuthRole[],
	scope?: AuthScope,
) => {
	if (!user) return false;
	if (!user.role) return false;

	if (user.role === 'superadmin') return true;
	if (user.role === 'admin') return true;

	if (!roles.includes(user.role)) {
		return false;
	}

	if (scope && hasScope(user, scope)) {
		return true;
	}

	return false;
};

const hasScope = (user: Session['user'], scope: AuthScope) => {
	if (!user.scopes) return false;

	return user.scopes.includes(scope);
};
