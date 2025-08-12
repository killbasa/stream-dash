import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';

export const alias = {
	$components: resolve('./src/components'),
	$src: resolve('./src'),
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias,
		csp: {
			directives: {
				'default-src': ['none'],
				'font-src': ['self'],
				'img-src': ['self', 'https://imagedelivery.net'],
				'connect-src': ['self'],
				'script-src': ['self'],
				'style-src': ['self', 'unsafe-inline'],
				'frame-src': ['https://*.cloudflarestream.com'],
			},
		},
	},
};

export default config;
