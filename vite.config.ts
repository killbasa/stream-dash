import { alias } from './svelte.config.js'; // Import to ensure svelte config is loaded
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import type { CommonServerOptions } from 'vite';

const serverOptions: CommonServerOptions = {
	port: 5173,
	strictPort: true,
};

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: serverOptions,
	preview: serverOptions,
	test: {
		globals: true,
		alias,
		coverage: {
			provider: 'v8',
			reporter: ['text'],
			exclude: [...(configDefaults.coverage.exclude ?? []), './src/lib/components/**'],
		},
		clearMocks: true,
		mockReset: true,
	},
});
