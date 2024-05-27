import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions'
  ],
  framework: {
    name: '@storybook/sveltekit',
    options: {}
  },
  staticDirs: ['../static'],
  core: {
    builder: '@storybook/builder-vite'
  },
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
    console.log(updatedConfig);
    return updatedConfig;
  }
};
export default config;
