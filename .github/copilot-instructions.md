# Repo-specific instructions for AI coding agents

This repository is a SvelteKit app (Svelte 4) managed with Yarn 4.

- Quick commands (use `yarn`):

  - Dev server: `yarn dev` (runs `yarn theme` then `vite dev`)
  - Build: `yarn build` (runs `yarn theme` then `vite build`)
  - Preview: `yarn preview`
  - Storybook: `yarn storybook` (also runs `yarn theme`)
  - Lint: `yarn lint` (ESLint)

- Important project files to consult:

  - `package.json` — scripts, Yarn 4, important resolutions/patches (e.g. `bson` patch).
  - `README.md` — architecture notes (store flow, singletons, recurring tasks) and local development tips.
  - `svelte.config.js` — adapter (static), and path aliases ($components, $stores, $services, ...).
  - `vite.config.ts` — Sentry integration, node polyfills for browser crypto, Vitest merge.
  - `src/globalStyles/_smui-theme.scss` and `src/globalStyles` — theme inputs used by `yarn theme`.
  - `src/components` — UI components; look for files prefixed with `Singleton` (single-instance components exposing imperative update functions).
  - `src/stores` and `src/services` — core state patterns. See `README.md` for parent/child store sequence diagram and `pageInfo.ts` usage.
  - `hooks.client.ts` — Sentry initialization / logging.

- Architecture & conventions (concrete):

  - Yarn 4 is required. The repo uses workspace-level patches and `yarn up` helpers; do not switch package manager.
  - Theme must be compiled before dev/build/preview/storybook. Many scripts run `yarn theme` first. If you change `src/globalStyles/_smui-theme.scss` or add SMUI components, restart the dev server.
  - Singleton UI components: files named `Singleton*` are single-instance widgets (snackbar, confetti, dialogs). They export imperative functions to update/show state rather than being instantiated multiple times.
  - Stores pattern: there are parent stores containing variable-length collections and child stores for individual items. When modifying a child, the code often updates child store, then parent store persists to LocalData/back-end. Check `src/stores/*` and the `README.md` sequence diagram for the expected flow.
  - Routes: prefer copying an existing route folder and adapting. `pageInfo.ts` files are kept outside module context because they must be importable before Svelte module load.

- Integrations & environment notes:

  - Sentry: configured both in `vite.config.ts` (upload source maps) and `hooks.client.ts`. `SENTRY_AUTH_TOKEN` must be set to enable uploads. Vite logs an error if the token is missing.
  - Node polyfills: `vite-plugin-node-polyfills` is used so some node packages (crypto, util, stream) work in browser bundles.
  - Adapter: SvelteKit uses `@sveltejs/adapter-static` with `fallback: 'app.html'`. Production output is in `build/`.

- Editing/build safety checks:

  - Always run `yarn theme` before testing build-related changes that touch styles or SMUI.
  - If adding a new SMUI component, add the package and restart the dev server so `static/smui.css` regenerates.
  - If working on Sentry or source maps, ensure `SENTRY_AUTH_TOKEN` is provided (local env or CI secret).

- Small contract for an agent working here:

  1. Read `package.json` & `README.md` to learn workflow scripts and store patterns.
  2. For UI changes, run `yarn theme` and `yarn dev` locally; verify styles in `static/smui.css`.
  3. For code changes, run `yarn test` and `yarn lint` where applicable.

- Examples to reference when making edits:
  - Theme compile step: see `package.json` -> `theme` script.
  - Sentry token check and plugin ordering: `vite.config.ts` — `sentrySvelteKit` is registered before `sveltekit()`.
  - Aliases useful for imports: `$components`, `$stores`, `$services` (defined in `svelte.config.js`).

If anything here is unclear or you'd like me to expand sections (for example, list top stores/services or create quick test runners), tell me what to add and I'll iterate.
