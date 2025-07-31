import Cloudflare from 'cloudflare';
import { env } from '$env/dynamic/private';

export const cloudflare = new Cloudflare({
	apiToken: env.CLOUDFLARE_API_TOKEN,
});
