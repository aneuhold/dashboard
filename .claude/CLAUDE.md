@../README.md

# dashboard

## Language

@../node_modules/@aneuhold/robot-instructions/src/instructions/lang/typescript.md

@../node_modules/@aneuhold/robot-instructions/src/instructions/lang/css.md

## Runtime

@../node_modules/@aneuhold/robot-instructions/src/instructions/runtime/node.md

## Framework

@../node_modules/@aneuhold/robot-instructions/src/instructions/framework/svelte.md

@../node_modules/@aneuhold/robot-instructions/src/instructions/framework/sveltekit.md

## Tooling

@../node_modules/@aneuhold/robot-instructions/src/instructions/tooling/vitest.md

@../node_modules/@aneuhold/robot-instructions/src/instructions/tooling/storybook.md

## UI

@../node_modules/@aneuhold/robot-instructions/src/instructions/ui/smui.md

## This repo

A SvelteKit app (Svelte 5) using SMUI (Svelte Material UI) components, managed with pnpm.

### Quick commands

- Dev server: `pnpm dev` (runs `pnpm theme` then `vite dev`)
- Build: `pnpm build` (runs `pnpm theme` then `vite build`)
- Preview: `pnpm preview`
- Storybook: `pnpm storybook` (also runs `pnpm theme`)
- Check: `pnpm check` (TypeScript + circular dependency check)
- Lint: `pnpm lint` (ESLint)
- Test: `pnpm test` (Vitest)

### Important project files

- `package.json`: scripts, pnpm configuration
- `README.md`: architecture notes (store flow, singletons, recurring tasks) and local development tips
- `svelte.config.js`: adapter (static), path aliases (`$components`, `$stores`, `$services`, `$util`, `$actions`)
- `vite.config.ts`: Sentry integration, node polyfills for browser crypto, Vitest
- `src/globalStyles/_smui-theme.scss` and `src/globalStyles`: theme inputs used by `pnpm theme`
- `src/components`: UI components
- `src/stores` and `src/services`: core state patterns. See `README.md` for the parent/child store sequence diagram and `pageInfo.ts` usage

### Shared library: `@aneuhold/core-ts-db-lib`

The dashboard app depends on `@aneuhold/core-ts-db-lib`, a schema-first data modeling and service library located on disk at `~/Development/GithubRepos/ts-libs/packages/core-ts-db-lib`. Key folders:

- `src/documents/`: Zod-validated document types
- `src/embedded-types/`: nested value types used within documents
- `src/services/`: domain logic services
- `src/documents/common/`: shared documents (User, ApiKey)

You are encouraged to modify this library when the change involves document types, embedded types, or core domain logic that doesn't involve frontend state. If you make changes there, follow the instructions at `~/Development/GithubRepos/ts-libs/.claude/CLAUDE.md`. Run appropriate tests and add new tests for any changes. Once all changes in the library are complete, wait 6 seconds before expecting them to reflect in the dashboard app. Changes propagate automatically.

### Conventions

- The `aneuhold/service-file-structure` lint rule enforces the service file naming and file shape.
- Theme colors come from the CSS custom properties defined in `src/globalStyles/_smui-theme.scss` (`var(--mdc-theme-primary)`, `var(--mdc-theme-on-primary)`, `var(--success)`, `var(--error)`).
- Use the utilities in `testUtils/` whenever possible to avoid duplication in tests.

### Integrations and environment

- **Sentry**: configured both in `vite.config.ts` (upload source maps) and `hooks.client.ts`. `SENTRY_AUTH_TOKEN` must be set to enable uploads. Vite logs an error if the token is missing. The Sentry MCP organization slug is `anton-neuhold`.
- **Node polyfills**: `vite-plugin-node-polyfills` is used so some node packages (crypto, util, stream) work in browser bundles.
- **Adapter**: SvelteKit uses `@sveltejs/adapter-static` with `fallback: 'app.html'`. Production output is in `build/`.

### Before considering a task complete

1. Run + fix any issues that come up: `pnpm lint --fix`, `pnpm check`, and `pnpm test`.
