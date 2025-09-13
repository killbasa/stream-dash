export const AuthMemberScopes = {
	LiveInputsEdit: 'live-inputs/edit',
	LiveInputsRead: 'live-inputs/read',
	TalentsEdit: 'talents/edit',
	TalentsRead: 'talents/read',
	LocationsEdit: 'locations/edit',
	LocationsRead: 'locations/read',
	BlocksEdit: 'blocks/edit',
	BlocksRead: 'blocks/read',
} as const;
export type AuthMemberScope = (typeof AuthMemberScopes)[keyof typeof AuthMemberScopes];

export const ReadableMemberScopes: { value: string; name: string }[] = [
	{ value: AuthMemberScopes.LiveInputsEdit, name: 'Live Inputs - Edit' },
	{ value: AuthMemberScopes.LiveInputsRead, name: 'Live Inputs - Read' },
	{ value: AuthMemberScopes.TalentsEdit, name: 'Talents - Edit' },
	{ value: AuthMemberScopes.TalentsRead, name: 'Talents - Read' },
	{ value: AuthMemberScopes.LocationsEdit, name: 'Locations - Edit' },
	{ value: AuthMemberScopes.LocationsRead, name: 'Locations - Read' },
	{ value: AuthMemberScopes.BlocksEdit, name: 'Blocks - Edit' },
	{ value: AuthMemberScopes.BlocksRead, name: 'Blocks - Read' },
];

export const AuthInstanceRoles = {
	admin: 'admin',
	user: 'user',
} as const;
export type AuthInstanceRole = (typeof AuthInstanceRoles)[keyof typeof AuthInstanceRoles];
