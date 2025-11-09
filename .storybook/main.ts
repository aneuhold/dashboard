import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx|svelte)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-svelte-csf'
  ],
  framework: {
    name: '@storybook/sveltekit',
    options: {}
  },
  staticDirs: ['../static'],
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    const updatedConfig = mergeConfig(config, {
      // Paths here seem to be from the root directory
      server: {
        fs: {
          allow: ['./static']
        }
      }
    });
    return updatedConfig;
  }
};
export default config;
