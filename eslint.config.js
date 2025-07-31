import cfg from './svelte.config.js';
import eslintConfig from '@killbasa/eslint-config/svelte';

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const config = [
	...eslintConfig(cfg),
	{
		name: 'ignore',
		ignores: ['.svelte-kit/', 'build/', 'node_modules/'],
	},
	{
		files: ['**/*.svelte'],
		rules: {
			'import/no-duplicates': 'off',
			'import/no-unresolved': ['error', { ignore: ['^\\$app/', '^\\$env'] }],
		},
	},
	{
		files: ['**/*.ts'],
		rules: {
			'import/no-unresolved': ['error', { ignore: ['^\\$app/', '^\\$env', '^\\$lib/'] }],
		},
	},
];

export default config;
