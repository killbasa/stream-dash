import { prisma } from './db/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { env } from '$env/dynamic/private';

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	emailAndPassword: {
		enabled: false,
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	user: {
		additionalFields: {
			role: {
				type: ['admin', 'editor', 'reader'],
				required: false,
				defaultValue: 'reader',
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
							return false;
						}

						return Promise.resolve({
							data: {
								...user,
								role: whitelist.defaultRole,
								scopes: [],
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
