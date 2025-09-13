import {
	InstanceAccessControl,
	InstanceAdminRole,
	InstanceEditorRole,
	InstanceUserRole,
} from './auth/permissions';
import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient({
	plugins: [
		adminClient({
			ac: InstanceAccessControl,
			roles: {
				admin: InstanceAdminRole,
				editor: InstanceEditorRole,
				user: InstanceUserRole,
			},
		}),
	],
});

export type Session = typeof authClient.$Infer.Session;
