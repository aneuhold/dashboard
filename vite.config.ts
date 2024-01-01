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
  optimizeDeps: {
    // Fixes an issue where it throws an error about top-level await
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
