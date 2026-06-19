import svelteConfig from '@aneuhold/eslint-config/src/configs/svelte-config.ts';
import storybook from 'eslint-plugin-storybook';

export default [
  // This config file is excluded from type-aware linting: it imports the shared
  // config via a `.ts` path (required so jiti resolves the TypeScript source),
  // which is not part of the app's tsconfig project.
  {
    ignores: ['eslint.config.ts']
  },
  ...svelteConfig,
  ...storybook.configs['flat/recommended'],
  {
    rules: {
      // Disabled because it seemed to be causing issues with a generic type
      // that is used in an assertion `as type` at the end of a method
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      // Disabling this because we have a bunch of dynamic routes
      'svelte/no-navigation-without-resolve': 'off',
      // Disabled due to false positives with Svelte components
      '@typescript-eslint/no-useless-default-assignment': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/prefer-literal-enum-member': 'off',
      // This seems to get confused with the interaction between Svelte and TypeScript, and gets
      // in an infinite loop.
      '@typescript-eslint/no-unnecessary-type-arguments': 'off'
    }
  }
];
