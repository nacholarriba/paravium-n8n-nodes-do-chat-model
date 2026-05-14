import tseslint from 'typescript-eslint';
import eslintPluginN8nNodesBase from 'eslint-plugin-n8n-nodes-base';

export default [
	...tseslint.configs.recommended,
	{
		files: ['nodes/**/*.ts', 'credentials/**/*.ts'],
		plugins: {
			'n8n-nodes-base': eslintPluginN8nNodesBase,
		},
		rules: {
			...eslintPluginN8nNodesBase.configs.community.rules,
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
	{
		ignores: ['dist/**', 'node_modules/**'],
	},
];