import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { defineConfig, mergeConfig } from 'vitest/config';

const viteConfig: UserConfig = {
  plugins: [sveltekit()],
  /* This was disabled because it was causing a bunch of build output errors
  It could potentially be turned back on if needed.
  ssr: {
    noExternal: [/^@material\//]
  },*/
  resolve: {
    dedupe: ['svelte']
  },
  build: {
    // Solves the top-level await issue when running `build`
    target: 'esnext'
  },
  optimizeDeps: {
    // Fixes an issue where it throws an error about top-level await when
    // running `dev`
    exclude: ['bson']
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
