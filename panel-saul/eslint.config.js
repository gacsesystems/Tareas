import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config([
	// Archivos a ignorar
	{
		ignores: [
			'dist/**/*',
			'build/**/*',
			'node_modules/**/*',
			'coverage/**/*',
			'*.config.js',
			'*.config.ts',
			'vite.config.*',
			'vitest.config.*',
			'playwright.config.*',
		],
	},

	// Configuración base para JavaScript
	{
		files: ['**/*.{js,jsx}'],
		extends: [js.configs.recommended],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.es2021,
				...globals.node,
			},
		},
	},

	// Configuración principal para TypeScript + React
	{
		files: ['**/*.{ts,tsx}'],
		extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked, ...tseslint.configs.stylisticTypeChecked],
		plugins: {
			react: react,
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			'jsx-a11y': jsxA11y,
			import: importPlugin,
		},
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.es2021,
			},
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
				project: ['./tsconfig.json', './tsconfig.node.json'],
				tsconfigRootDir: import.meta.dirname,
			},
		},
		settings: {
			react: {
				version: 'detect',
			},
			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
					project: './tsconfig.json',
				},
				node: true,
			},
		},
		rules: {
			// React Rules
			...react.configs.recommended.rules,
			...react.configs['jsx-runtime'].rules,
			...reactHooks.configs.recommended.rules,
			'react/react-in-jsx-scope': 'off',
			'react/jsx-uses-react': 'off',
			'react/prop-types': 'off',
			'react/jsx-key': [
				'error',
				{
					checkFragmentShorthand: true,
					checkKeyMustBeforeSpread: true,
				},
			],
			'react/jsx-no-target-blank': [
				'error',
				{
					allowReferrer: false,
					enforceDynamicLinks: 'always',
				},
			],
			'react/jsx-curly-brace-presence': [
				'error',
				{
					props: 'never',
					children: 'never',
				},
			],
			'react/self-closing-comp': 'error',
			'react/jsx-boolean-value': ['error', 'never'],

			// React Refresh
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

			// TypeScript Rules
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-unsafe-assignment': 'error',
			'@typescript-eslint/no-unsafe-member-access': 'error',
			'@typescript-eslint/no-unsafe-call': 'error',
			'@typescript-eslint/no-unsafe-return': 'error',
			'@typescript-eslint/prefer-nullish-coalescing': 'error',
			'@typescript-eslint/prefer-optional-chain': 'error',
			'@typescript-eslint/no-unnecessary-condition': 'error',
			'@typescript-eslint/strict-boolean-expressions': 'error',
			'@typescript-eslint/prefer-as-const': 'error',
			'@typescript-eslint/no-inferrable-types': 'error',
			'@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
			'@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', disallowTypeAnnotations: false }],
			'@typescript-eslint/no-import-type-side-effects': 'error',

			// Import/Export Rules
			'import/order': [
				'error',
				{
					groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
					'newlines-between': 'always',
					pathGroups: [
						{
							pattern: 'react',
							group: 'external',
							position: 'before',
						},
						{
							pattern: '@/**',
							group: 'internal',
						},
					],
					pathGroupsExcludedImportTypes: ['react'],
				},
			],
			'import/no-duplicates': ['error', { 'prefer-inline': true }],
			'import/no-unresolved': 'error',
			'import/no-cycle': 'error',

			// Accessibility Rules
			...jsxA11y.configs.recommended.rules,
			'jsx-a11y/alt-text': 'error',
			'jsx-a11y/anchor-has-content': 'error',
			'jsx-a11y/click-events-have-key-events': 'error',
			'jsx-a11y/no-static-element-interactions': 'error',

			// General JavaScript Rules
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'no-debugger': 'error',
			'no-alert': 'warn',
			'prefer-const': 'error',
			'no-var': 'error',
			'object-shorthand': 'error',
			'prefer-arrow-callback': 'error',
			'prefer-template': 'error',
			'template-curly-spacing': 'error',
			'no-useless-concat': 'error',
			'no-useless-template-literals': 'error',
			'no-duplicate-imports': 'error',
			'no-unused-expressions': 'error',
			'no-nested-ternary': 'warn',
			'max-depth': ['error', 4],
			complexity: ['warn', 10],

			// Naming Conventions
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'interface',
					format: ['PascalCase'],
					prefix: ['I'],
				},
				{
					selector: 'typeAlias',
					format: ['PascalCase'],
				},
				{
					selector: 'enum',
					format: ['PascalCase'],
				},
				{
					selector: 'enumMember',
					format: ['PascalCase'],
				},
				{
					selector: 'class',
					format: ['PascalCase'],
				},
				{
					selector: 'function',
					format: ['camelCase', 'PascalCase'],
				},
				{
					selector: 'variable',
					format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
					leadingUnderscore: 'allow',
				},
			],
		},
	},

	// Configuración específica para archivos de configuración
	{
		files: ['**/*.config.{js,ts}', '**/vite.config.{js,ts}'],
		rules: {
			'no-console': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},

	// Configuración específica para archivos de test
	{
		files: ['**/*.{test,spec}.{js,ts,jsx,tsx}', '**/__tests__/**/*'],
		languageOptions: {
			globals: {
				...globals.jest,
				...globals.vitest,
			},
		},
		rules: {
			'no-console': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
		},
	},
]);
