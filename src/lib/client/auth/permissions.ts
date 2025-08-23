import { createAccessControl } from 'better-auth/plugins/access';

// Organizations

export const OrgStatements = {
	blocks: ['create', 'read', 'update', 'delete'],
	liveinputs: ['create', 'read', 'update', 'delete'],
	locations: ['create', 'read', 'update', 'delete'],
	talents: ['create', 'read', 'update', 'delete'],
	notifications: ['read'],
	cloudflare: ['read', 'update'],

	organization: ['read', 'update'],
	members: ['create', 'read', 'update', 'delete', 'demote', 'promote'],
} as const;

export const OrgAccessControl = createAccessControl(OrgStatements);

export const OrgEditorRole = OrgAccessControl.newRole({
	blocks: ['create', 'read', 'update', 'delete'],
	liveinputs: ['create', 'read', 'update', 'delete'],
	locations: ['create', 'read', 'update', 'delete'],
	talents: ['create', 'read', 'update', 'delete'],
});

export const OrgOwnerRole = OrgAccessControl.newRole({
	...OrgEditorRole.statements,

	cloudflare: ['update'],

	organization: ['read', 'update'],
	members: ['create', 'read', 'update', 'delete', 'demote', 'promote'],
});

export const OrgAdminRole = OrgAccessControl.newRole({
	...OrgEditorRole.statements,

	cloudflare: ['read', 'update'],

	organization: ['update'],
	members: ['create', 'read', 'update', 'delete'],
});

export const OrgMemberRole = OrgAccessControl.newRole({
	blocks: ['read'],
	liveinputs: ['read'],
	locations: ['read'],
	talents: ['read'],
});

// Instance

export const InstanceStatements = {
	user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete', 'set-password', 'update'],
	session: ['list', 'revoke', 'delete'],

	organizations: ['create', 'read', 'update', 'delete'],
	whitelists: ['create', 'read', 'update', 'delete'],
} as const;

export const InstanceAccessControl = createAccessControl(InstanceStatements);

export const InstanceSuperadminRole = InstanceAccessControl.newRole({
	user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete', 'set-password'],
	session: ['list', 'revoke', 'delete'],

	organizations: ['create', 'read', 'update', 'delete'],
	whitelists: ['create', 'read', 'update', 'delete'],
});

export const InstanceUserRole = InstanceAccessControl.newRole({
	user: [],
	session: [],

	organizations: [],
	whitelists: [],
});
