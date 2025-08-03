import type { Session } from '$lib/client/auth';
import type { AuthScope } from '$lib/client/constants';

export const hasPermission = (
	user: Session['user'] | undefined,
	roles: ('superadmin' | 'admin' | 'editor' | 'reader')[],
	scope?: AuthScope,
) => {
	if (!user) return false;
	if (!user.role) return false;

	if (user.role === 'superadmin' || user.role === 'admin') return true;

	if (roles.includes(user.role)) {
		if (scope && !hasScope(user, scope)) {
			return false;
		}

		return true;
	}

	return false;
};

const hasScope = (user: Session['user'], scope: AuthScope) => {
	if (!user.scopes) return false;

	return user.scopes.includes(scope);
};
