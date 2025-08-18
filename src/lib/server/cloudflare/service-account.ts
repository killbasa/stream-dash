import Cloudflare from 'cloudflare';
import { env } from 'process';

export const getCloudflareServiceAccount = (): {
	cloudflare: Cloudflare;
	accountId: string;
} => {
	return {
		cloudflare: new Cloudflare({
			apiToken: env.CLOUDFLARE_API_TOKEN!,
		}),
		accountId: env.CLOUDFLARE_ACCOUNT_ID!,
	};
};
