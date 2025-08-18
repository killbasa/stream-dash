import { prisma } from '../db/client';
import Cloudflare from 'cloudflare';

export const getCloudflareClient = async (
	orgId: string,
): Promise<{ cloudflare: Cloudflare; accountId: string }> => {
	const settings = await prisma.cloudflareCredentials.findUnique({
		where: {
			organizationId: orgId,
		},
	});

	if (!settings) {
		throw new Error('Cloudflare credentials not set for organization');
	}

	return {
		cloudflare: new Cloudflare({
			apiToken: settings.apiToken,
		}),
		accountId: settings.accountId,
	};
};
