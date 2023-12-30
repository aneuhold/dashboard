import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { defineConfig, mergeConfig } from 'vitest/config';

const viteConfig: UserConfig = {
  plugins: [sveltekit()],
  ssr: {
    noExternal: [/^@material\//]
  },
  resolve: {
    dedupe: ['svelte']
  },
  // Added so that top-level await works.
  build: {
    target: 'esnext'
  },
  css: {
    postcss: {}
  }
};

const vitestConfig = defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});

export default mergeConfig(viteConfig, vitestConfig);
