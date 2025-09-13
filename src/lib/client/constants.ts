export const AuthInstanceRoles = {
	admin: 'admin',
	editor: 'editor',
	user: 'user',
} as const;
export type AuthInstanceRole = (typeof AuthInstanceRoles)[keyof typeof AuthInstanceRoles];
