import { prisma } from './db/client';
import {
	InstanceAccessControl,
	InstanceAdminRole,
	InstanceUserRole,
} from '../client/auth/permissions';
import { AuthInstanceRoles } from '../client/constants';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
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
			adminRoles: ['admin'],
			defaultRole: 'user',
			roles: {
				admin: InstanceAdminRole,
				user: InstanceUserRole,
			},
		}),
	],
	user: {
		additionalFields: {
			role: {
				type: [...Object.values(AuthInstanceRoles)],
				required: false,
				defaultValue: AuthInstanceRoles.user,
				input: false,
			},
			scopes: {
				type: 'string[]',
				required: false,
				defaultValue: [],
				input: false,
			},
		},
	},
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
