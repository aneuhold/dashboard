# Repo-specific instructions for AI coding agents

This repository is a SvelteKit app (Svelte 5) managed with Yarn 4.

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

- Architecture & conventions (concrete):
  - Singleton UI components: files named `Singleton*` are single-instance widgets (snackbar, confetti, dialogs). They export imperative functions to update/show state rather than being instantiated multiple times.
  - Stores pattern: there are parent stores containing variable-length collections and child stores for individual items. When modifying a child, the code often updates child store, then parent store persists to LocalData/back-end. Check `src/stores/*` and the `README.md` sequence diagram for the expected flow.
  - Routes: prefer copying an existing route folder and adapting. `pageInfo.ts` files are kept outside module context because they must be importable before Svelte module load.

- Integrations & environment notes:
  - Sentry: configured both in `vite.config.ts` (upload source maps) and `hooks.client.ts`. `SENTRY_AUTH_TOKEN` must be set to enable uploads. Vite logs an error if the token is missing.
  - Node polyfills: `vite-plugin-node-polyfills` is used so some node packages (crypto, util, stream) work in browser bundles.
  - Adapter: SvelteKit uses `@sveltejs/adapter-static` with `fallback: 'app.html'`. Production output is in `build/`.

- Small contract for an agent working here:
  1. Read `package.json` & `README.md` to learn workflow scripts and store patterns.
  2. For code changes, run `yarn test` and `yarn lint` where applicable.

- Examples to reference when making edits:
  - Aliases useful for imports: `$components`, `$stores`, `$services` (defined in `svelte.config.js`).

## Code Style

### Types & Functions

- Add explicit types when unclear; extract complex object types to separate `type` declarations
- Use PascalCase for type names; file names should match the primary exported type
- Use arrow functions and `const`/`let` (never `var`)
- Use `async`/`await` instead of `.then()`

### Documentation & Naming

- Add JSDoc for all methods, functions, and classes (include `@param`, omit `@returns`)
- Add JSDoc for public class properties only if complex
- Never prefix functions/methods with underscores

### Class Structure

- Order methods by visibility: public, protected, private
- Within same visibility, order doesn't matter

## File Organization

### Imports

- Use relative imports within package, package references for external packages
- Use named imports only (never `import * as`)
- Import at file top (inline only when absolutely necessary)
- Use a group-level barrel: each component group (e.g., index.ts) is the canonical public surface and must re-export components directly from their .svelte files (e.g., export { default as DatePickerDialog } from './DatePickerDialog.svelte';).
- Only add a per-component index.ts when the folder needs to expose multiple symbols (component + helpers); when present, re-export explicitly as named exports (e.g., export { default as X } from './X.svelte'; `export * from './helpers'`);

### Enums

- Use PascalCase for enum names and values
- Use TypeScript `enum` (not `const enum` or `type`)
