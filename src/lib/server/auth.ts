import { prisma } from './db/client';
import {
	InstanceAccessControl,
	InstanceSuperadminRole,
	InstanceUserRole,
	OrgAccessControl,
	OrgAdminRole,
	OrgEditorRole,
	OrgMemberRole,
	OrgOwnerRole,
} from '../client/auth/permissions';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, organization } from 'better-auth/plugins';
import { env } from '$env/dynamic/private';

export const auth = betterAuth({
	telemetry: {
		enabled: false,
	},
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	emailAndPassword: {
		enabled: false,
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID!,
			clientSecret: env.GOOGLE_CLIENT_SECRET!,
		},
	},
	plugins: [
		admin({
			ac: InstanceAccessControl,
			adminRoles: ['superadmin'],
			defaultRole: 'user',
			roles: {
				superadmin: InstanceSuperadminRole,
				user: InstanceUserRole,
			},
		}),
		organization({
			ac: OrgAccessControl,
			adminRoles: ['owner', 'admin'],
			creatorRole: 'owner',
			defaultRole: 'member',
			roles: {
				owner: OrgOwnerRole,
				admin: OrgAdminRole,
				editor: OrgEditorRole,
				member: OrgMemberRole,
			},
			allowUserToCreateOrganization: (user) => {
				return user.role === 'superadmin';
			},
		}),
	],
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					try {
						const whitelist = await prisma.whitelist.findUnique({
							where: { email: user.email },
						});

						if (!whitelist) {
							console.warn('User not found in whitelist.');
							return false;
						}

						await prisma.whitelist.delete({
							where: { email: user.email },
						});

						return Promise.resolve({
							data: {
								...user,
								role: whitelist.defaultRole,
							},
						});
					} catch (error) {
						console.error('Error in user creation hook:', error);
					}

					return false;
				},
			},
		},
	},
});
