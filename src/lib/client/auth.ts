import { InstanceAccessControl, InstanceAdminRole, InstanceUserRole } from './auth/permissions';
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';
import type { auth } from '../server/auth';

export const authClient = createAuthClient({
	plugins: [
		inferAdditionalFields<typeof auth>(),
		adminClient({
			ac: InstanceAccessControl,
			roles: {
				admin: InstanceAdminRole,
				user: InstanceUserRole,
			},
		}),
	],
});

export type Session = typeof authClient.$Infer.Session;
