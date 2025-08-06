export const AuthScopes = {
	LiveInputsEdit: 'live-inputs/edit',
	LiveInputsRead: 'live-inputs/read',
	TalentsEdit: 'talents/edit',
	TalentsRead: 'talents/read',
	LocationsEdit: 'locations/edit',
	LocationsRead: 'locations/read',
	BlocksEdit: 'blocks/edit',
	BlocksRead: 'blocks/read',
} as const;
export type AuthScope = (typeof AuthScopes)[keyof typeof AuthScopes];

export const ReadableScopes: { value: string; name: string }[] = [
	{ value: AuthScopes.LiveInputsEdit, name: 'Live Inputs - Edit' },
	{ value: AuthScopes.LiveInputsRead, name: 'Live Inputs - Read' },
	{ value: AuthScopes.TalentsEdit, name: 'Talents - Edit' },
	{ value: AuthScopes.TalentsRead, name: 'Talents - Read' },
	{ value: AuthScopes.LocationsEdit, name: 'Locations - Edit' },
	{ value: AuthScopes.LocationsRead, name: 'Locations - Read' },
	{ value: AuthScopes.BlocksEdit, name: 'Blocks - Edit' },
	{ value: AuthScopes.BlocksRead, name: 'Blocks - Read' },
];

export const AuthRoles = {
	superadmin: 'superadmin',
	admin: 'admin',
	user: 'user',
} as const;
export type AuthRole = (typeof AuthRoles)[keyof typeof AuthRoles];
