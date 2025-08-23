import {
	InstanceAccessControl,
	InstanceSuperadminRole,
	InstanceUserRole,
	OrgAccessControl,
	OrgAdminRole,
	OrgEditorRole,
	OrgMemberRole,
	OrgOwnerRole,
} from './auth/permissions';
import { adminClient, organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient({
	plugins: [
		adminClient({
			ac: InstanceAccessControl,
			roles: {
				superadmin: InstanceSuperadminRole,
				user: InstanceUserRole,
			},
		}),
		organizationClient({
			ac: OrgAccessControl,
			roles: {
				owner: OrgOwnerRole,
				admin: OrgAdminRole,
				editor: OrgEditorRole,
				member: OrgMemberRole,
			},
		}),
	],
});

export type Session = typeof authClient.$Infer.Session;
export type Organization = typeof authClient.$Infer.Organization;
export type Member = typeof authClient.$Infer.Member;
