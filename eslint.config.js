// @ts-check

import svelteConfig from '@aneuhold/eslint-config/src/svelte-config.js';

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray} */
export default [
  ...svelteConfig,
  {
    // other override settings. e.g. for `files: ['**/*.test.*']`
  }
];
