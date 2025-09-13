import { createAccessControl } from 'better-auth/plugins/access';

// Organizations

export const InstanceStatements = {
	blocks: ['create', 'read', 'update', 'delete'],
	liveinputs: ['create', 'read', 'update', 'delete'],
	locations: ['create', 'read', 'update', 'delete'],
	talents: ['create', 'read', 'update', 'delete'],
	notifications: ['read'],

	user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete', 'set-password', 'update'],
	session: ['list', 'revoke', 'delete'],
	whitelists: ['create', 'read', 'update', 'delete'],
} as const;

export const InstanceAccessControl = createAccessControl(InstanceStatements);

export const InstanceUserRole = InstanceAccessControl.newRole({
	blocks: ['read'],
	liveinputs: ['read'],
	locations: ['read'],
	talents: ['read'],

	user: [],
	session: [],
	whitelists: [],
});

export const InstanceEditorRole = InstanceAccessControl.newRole({
	...InstanceUserRole.statements,

	blocks: ['create', 'read', 'update', 'delete'],
	liveinputs: ['create', 'read', 'update', 'delete'],
	locations: ['create', 'read', 'update', 'delete'],
	talents: ['create', 'read', 'update', 'delete'],
});

export const InstanceAdminRole = InstanceAccessControl.newRole({
	...InstanceEditorRole.statements,

	user: ['create', 'list', 'set-role', 'ban', 'impersonate', 'delete', 'set-password', 'update'],
	session: ['list', 'revoke', 'delete'],
	whitelists: ['create', 'read', 'update', 'delete'],
});
