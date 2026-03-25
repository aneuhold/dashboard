# Repo-specific instructions for AI coding agents

This repository is a SvelteKit app (Svelte 5) using SMUI (Svelte Material UI) components, managed with pnpm.

## Quick Commands

Use `pnpm` for all package management:

- Dev server: `pnpm dev` (runs `pnpm theme` then `vite dev`)
- Build: `pnpm build` (runs `pnpm theme` then `vite build`)
- Preview: `pnpm preview`
- Storybook: `pnpm storybook` (also runs `pnpm theme`)
- Check: `pnpm check` (TypeScript + circular dependency check)
- Lint: `pnpm lint` (ESLint)
- Test: `pnpm test` (Vitest)

## Important Project Files

- `package.json` — scripts, pnpm configuration
- `README.md` — architecture notes (store flow, singletons, recurring tasks) and local development tips
- `svelte.config.js` — adapter (static), path aliases ($components, $stores, $services, $util, $actions, etc.)
- `vite.config.ts` — Sentry integration, node polyfills for browser crypto, Vitest
- `src/globalStyles/_smui-theme.scss` and `src/globalStyles` — theme inputs used by `pnpm theme`
- `src/components` — UI components; look for files prefixed with `Singleton` (single-instance components exposing imperative update functions)
- `src/stores` and `src/services` — core state patterns. See `README.md` for parent/child store sequence diagram and `pageInfo.ts` usage

## Shared Library: `@aneuhold/core-ts-db-lib`

The dashboard app depends on `@aneuhold/core-ts-db-lib`, a schema-first data modeling and service library located on disk at `~/Development/GithubRepos/ts-libs/packages/core-ts-db-lib`. Key folders:

- `src/documents/` — Zod-validated document types
- `src/embedded-types/` — Nested value types used within documents
- `src/services/` — Domain logic services
- `src/documents/common/` — Shared documents (User, ApiKey)

**Making changes**: You are encouraged to modify this library when the change involves document types, embedded types, or core domain logic that doesn't involve frontend state. If you make changes there, follow the instructions at `~/Development/GithubRepos/ts-libs/.github/copilot-instructions.md`. Run appropriate tests and add new tests for any changes. Once all changes in the library are complete, **wait 6 seconds** before expecting them to reflect in the dashboard app — changes propagate automatically.

## Architecture & Conventions

### Component Patterns

- **Svelte 5 syntax**: Use modern runes (`$state()`, `$derived()`, `$effect()`, `$props()`)
- **Singleton components**: Files named `Singleton*` are single-instance widgets (snackbar, confetti, dialogs) that export imperative functions
- **Component docs**: Use JSDoc `@component` tag at top of `.svelte` files
- **SMUI components over raw HTML**: Always use SMUI components (e.g. `Icon` from `@smui/icon-button`) instead of raw HTML equivalents (e.g. `<span class="material-icons">`) for consistency with the design system
- **No inline styles**: Never use the `style` attribute on elements. Always use CSS classes — for SMUI components that don't accept a `class` prop directly, use `:global()` selectors scoped under a parent class
- **Theme colors**: Use CSS custom properties from the theme (`var(--mdc-theme-primary)`, `var(--mdc-theme-on-primary)`, `var(--success)`, `var(--error)`, etc.) defined in `src/globalStyles/_smui-theme.scss`. Never hardcode color values
- **Customizing SMUI component colors**: Override colors on MDC components using SASS mixins in `_smui-theme.scss`, not CSS overrides. Import the component's mixins (e.g. `@use '@material/circular-progress/mixins' as circular-progress`), then create a class scoped under the MDC base class (e.g. `.mdc-circular-progress.on-primary { @include circular-progress.color(theme.$on-primary); }`). Apply the class via the SMUI component's `class` prop. See the existing snackbar and button overrides in `_smui-theme.scss` for examples. The dev server must be restarted after theme changes
- **Transitions and animations**: Prefer smooth, eased transitions (0.5s+) over abrupt snaps. Elements appearing/disappearing should fade or slide rather than pop in/out

### Storybook Stories

- Each `Story` is an instance of the component being tested, not a wrapper. Build variations accordingly.
- If a wrapper is needed in order to properly demonstrate the functionality of the component, or provide easier access / test data to the various properties of the component, build a separate component next to the original called `SB<ComponentName>Example.svelte` and use that as your target component for the story variations.

### Routes & Pages

- Copy an existing route folder and adapt when creating new routes
- `pageInfo.ts` files are kept outside module context because they must be importable before Svelte component load

### State Management

- **Simple state**: Use Svelte 5 runes (`$state()`, `$derived()`)
- **Stores** (`src/stores`): For modules that export a real Svelte store using `writable`, `readable`, or `derived` from `svelte/store`
- **Services** (`src/services`): Singleton classes exported as default instances. Use services for rune-based reactive state (`$state`, `$derived`, `$effect`) and for non-reactive utilities. Name files as `<Name>Service.ts` or `<Name>Service.svelte.ts` if the file uses Svelte runes.

### Integrations & Environment

- **Sentry**: configured both in `vite.config.ts` (upload source maps) and `hooks.client.ts`. `SENTRY_AUTH_TOKEN` must be set to enable uploads. Vite logs an error if the token is missing.
- **Node polyfills**: `vite-plugin-node-polyfills` is used so some node packages (crypto, util, stream) work in browser bundles.
- **Adapter**: SvelteKit uses `@sveltejs/adapter-static` with `fallback: 'app.html'`. Production output is in `build/`.

## Before Considering a Task Complete

1. Run + fix any issues that come up: `pnpm lint --fix`, `pnpm check`, and `pnpm test`

## Tool Information

- **Sentry MCP server**: Organization slug is `anton-neuhold`

## Code Style

### Types & Functions

- NEVER EVER use `any` NOT EVEN IN TESTS (use `unknown` if necessary, and only if absolutely unavoidable).
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

### Barrel Files (`index.ts`)

- Only use a barrel file when a folder has a **single public export** and all other files in the folder are internal implementation details consumed exclusively by that export. This keeps the import path clean without the tree-shaking and performance downsides of large barrel files that re-export many modules.
- Do **not** create barrel files that aggregate exports from multiple unrelated modules. Every file in the folder should be reachable only through the one public export.

### Imports

- Use relative imports within package, package references for external packages
- Use named imports only (NEVER `import * as`)
- Import at file top (inline only when absolutely necessary)
- Aliases useful for imports: `$components`, `$stores`, `$services`, `$util`, `$actions` (defined in `svelte.config.js`)

### Enums

- Use PascalCase for enum names and values
- Use TypeScript `enum` (not `const enum` or `type`)
- Avoid string unions in as many cases as possible, prefer string enums for better readability and maintainability

### Syntax and Best Practices

- NEVER use `['propertyName']` syntax to access properties, always use `.propertyName` unless the property name is dynamic. Even then though, a variable / constant should be used instead of a string literal.
- Use object destructuring when accessing multiple properties from an object
- Prefer template literals over string concatenation.

## Tests

- Follow the same TypeScript conventions as in the main codebase, including never using `any`
- Use Vitest for unit tests
- Writes tests in a separate file next to the original but with `.test.ts` appended to the file name
- Prefer using real implementations over mocks unless necessary. For example, always use the associated Schema.parse to create new example documents in tests.
- DRY: Don't Repeat Yourself (avoid duplicate code in tests) Create helper functions for common test scenarios.
- Always make tests concise and focused on business logic, not implementation details.
- Use utilities in `/test-utils` whenever possible to avoid code duplication.
