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
			disableSignUp: import.meta.env.PROD,
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
});
