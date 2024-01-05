import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'app.html',
      precompress: false
    }),
    alias: {
      // this will match a directory and its contents
      // (`my-directory/x` resolves to `path/to/my-directory/x`)
      components: 'src/components',
      util: 'src/util',
      actions: 'src/actions'
    }
  }
};

export default config;
