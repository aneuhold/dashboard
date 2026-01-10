import { fileURLToPath } from 'node:url';
import { sentrySvelteKit } from '@sentry/sveltekit';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { sveltekit } from '@sveltejs/kit/vite';
import { playwright } from '@vitest/browser-playwright';
import path from 'path';
import { loadEnv, type UserConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { defineConfig, mergeConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Setup the Sentry Auth Token
let sentryAuthToken = '';
if (process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_AUTH_TOKEN !== '') {
  sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
} else {
  const env = loadEnv('', process.cwd(), 'SENTRY_AUTH_TOKEN');
  sentryAuthToken = env.SENTRY_AUTH_TOKEN;
}
if (!sentryAuthToken && !process.env.VITEST) {
  console.error('No Sentry Auth Token found in the environment variables.');
}

// Vitest specific logic to run
if (process.env.VITEST) {
  // Define the list of messages to suppress
  const messagesToSuppress = [/^Sourcemap for .* points to missing source files/];

  // It needs to be suppressed in this way instead of using customLogger from vite or onConsoleLog
  // from vitest because it seems that Vite or Rollup logs these warnings directly to stderr and not
  // through those hooks.
  const originalStderrWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk, ...args) => {
    const str = chunk.toString();
    if (messagesToSuppress.some((regex) => regex.test(str))) {
      return true;
    }

    // This is a crazy type because process.stderr.write can take different argument types
    return originalStderrWrite(
      chunk,
      ...(args as [BufferEncoding?, ((err?: Error | null) => void)?])
    );
  };
}

const viteConfig: UserConfig = {
  plugins: [
    // Make sure `sentrySvelteKit` is registered before `sveltekit`
    process.env.CI === 'true' &&
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
    /**
     * Bundle visualizer for analyzing the bundle size.
     *
     * Also import `import { visualizer } from 'rollup-plugin-visualizer';` at the top.
     */
    /*
    visualizer({
      open: true,
      filename: 'bundle-analysis.html',
      gzipSize: true,
      brotliSize: true
    })
    */
  ],
  resolve: {
    dedupe: ['svelte'],
    // This is needed to make sure that Svelte uses the browser build when running tests with Vitest
    // even though it is running in Node.
    conditions: process.env.VITEST ? ['browser'] : undefined
  },
  css: {
    postcss: {}
  }
};

const vitestConfig = defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    setupFiles: ['./testUtils/vitest-setup.ts'],
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            // The location of your Storybook config, main.js|ts
            configDir: path.join(dirname, '.storybook'),
            // This should match your package.json script to run Storybook
            // The --no-open flag will skip the automatic opening of a browser
            storybookScript: 'yarn storybook --no-open',
            // This is how storybook recommends filtering tests
            tags: {
              include: ['test']
            }
          })
        ],
        test: {
          name: 'storybook',
          // Includes for Storybook goes in the plugin option for tags above.
          // Enable browser mode
          browser: {
            enabled: true,
            // Make sure to install Playwright
            provider: playwright({}),
            headless: true,
            instances: [{ browser: 'chromium' }]
          },
          setupFiles: ['./.storybook/vitest.setup.ts']
        }
      }
    ]
  }
});

export default mergeConfig(viteConfig, vitestConfig);
