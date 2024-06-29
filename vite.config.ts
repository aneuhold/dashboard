import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { loadEnv, type UserConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { defineConfig, mergeConfig } from 'vitest/config';

// Setup the Sentry Auth Token
let sentryAuthToken = '';
if (process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_AUTH_TOKEN !== '') {
  sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
} else {
  const env = loadEnv('', process.cwd(), 'SENTRY_AUTH_TOKEN');
  sentryAuthToken = env.SENTRY_AUTH_TOKEN;
}

const viteConfig: UserConfig = {
  plugins: [
    // Make sure `sentrySvelteKit` is registered before `sveltekit`
    sentrySvelteKit({
      sourceMapsUploadOptions: {
        org: 'anton-neuhold',
        project: 'dashboard',
        authToken: sentryAuthToken
      }
    }),
    sveltekit(),
    // Added so that certain node packages work in the browser. The below
    // 3 are needed specifically for crypto it seems.
    nodePolyfills({
      include: ['crypto', 'util', 'stream']
    })
  ],
  /* This was disabled because it was causing a bunch of build output errors
  It could potentially be turned back on if needed.
  ssr: {
    noExternal: [/^@material\//]
  },*/
  resolve: {
    dedupe: ['svelte']
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
