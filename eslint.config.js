// @ts-check

import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginSvelte from 'eslint-plugin-svelte';
import globals from 'globals';
import svelteParser from 'svelte-eslint-parser';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
        project: true
      }
    }
  },
  {
    files: ['**/*.svelte'],
    extends: [
      ...eslintPluginSvelte.configs['flat/recommended'],
      ...eslintPluginSvelte.configs['flat/prettier']
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
      parser: svelteParser,
      parserOptions: {
        parser: tseslint.parser
      }
    },
    // Rules for svelte
    rules: {}
  },
  {
    // Rules for everything
    rules: {
      'no-use-before-define': 'off'
    }
  },
  {
    ignores: ['**/.svelte-kit', '**/.yarn', '**/build', '**/node_modules', '.DS_Store']
  },
  {
    // disable type-aware linting on JS files
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked
  }
);
