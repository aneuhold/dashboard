# Homelab Section Plan

Add a new top-level `homelab` section/route to the dashboard, gated behind a
per-user feature flag that defaults to `false` so no one has access by default.
Access is granted manually in the database, so no settings or admin UI is built.

## Decisions

- **Access model**: A `homelabPage` flag inside
  `DashboardUserConfig.enabledFeatures`. This mirrors the existing
  `financePage` / `automationPage` / `entertainmentPage` flags, which already
  default to `false` and gate their sections through the same nav filtering and
  page-guard mechanism.
- **Granting**: None in this change. The flag is flipped manually per user in
  the DB, exactly like the existing feature flags that have no UI toggle.

## Step 1 — Add the feature flag in `@aneuhold/core-ts-db-lib`

Library path: `~/Development/GithubRepos/ts-libs/packages/core-ts-db-lib`.
Follow `~/Development/GithubRepos/ts-libs/.github/copilot-instructions.md`.

- `src/documents/dashboard/UserConfig.ts`
  - In the `enabledFeatures` `z.object({ ... })`, add
    `homelabPage: z.boolean().default(false)` alongside the other feature
    booleans.
  - In the `.default({ ... })` object passed to the `enabledFeatures` field, add
    `homelabPage: false` so the explicit default object stays in sync with the
    schema shape.
- `src/documents/dashboard/UserConfig.spec.ts`
  - Add an assertion in the existing default-values test that a parsed/empty
    config yields `enabledFeatures.homelabPage === false`, following the pattern
    already used for the other feature flags.

No `browser.ts` export change is needed: `homelabPage` is a property on the
already-exported `DashboardUserConfigSchema` / `DashboardUserConfig` type.

Validation in the library: run `pnpm lint`, `pnpm check`, and `pnpm test` in the
package (or monorepo root). After the library work is complete, wait ~6 seconds
for changes to propagate to the dashboard app before relying on the new field.

## Step 2 — Create the homelab route

Create `src/routes/homelab/` by copying the structure of an existing simple
top-level section (e.g. `admin`):

- `src/routes/homelab/pageInfo.ts`
  - Export `homelabPageInfo: PageInfo` modeled on `adminPageInfo`:
    `shortTitle: 'Homelab'`, `title: 'Homelab'`, a short `description`,
    `url: '/homelab'`, an appropriate Material icon name (e.g. `dns` or
    `lan`), `clickAction` calling `goto(homelabPageInfo.url)`,
    `nestingLevel: 0`, `isInternalLink: true`.
- `src/routes/homelab/+page.ts`
  - `export const prerender = true;` (matches the other static sections).
- `src/routes/homelab/+page.svelte`
  - `@component` JSDoc header.
  - Build it as a link-list page modeled on `src/routes/dev/+page.svelte`,
    reusing the existing components — no new components are needed:
    - Import `Paper, { Content as PaperContent, Title }` from `@smui/paper`,
      `LinkList` from `$components/LinkList.svelte`, `LinkInfo` (type) from
      `$components/LinkListItem.svelte`, `PageTitle`, `PageNotFound` from
      `$components/PageNotFound.svelte`, `userConfig` from
      `$stores/local/userConfig/userConfig`, and `homelabPageInfo`.
  - Guard the page exactly like the dev page:
    `{#if !$userConfig.config.enabledFeatures.homelabPage}` render
    `<PageNotFound />` `{:else}` render `<svelte:head>` (title/meta), a
    `<PageTitle title={homelabPageInfo.title} />`, and a
    `<div class="content">` (flex column, `gap: 16px`) holding the grouped
    `Paper` cards below.
  - Each link uses `clickAction: () => window.open(<url>, '_blank')` and a
    Material icon via `iconName` (these are external links, so leave
    `isInternalLink` unset so the `open_in_new` affordance shows). Default the
    other Pi/router hostnames manually if they change.

  Suggested content (sourced from
  `~/Development/GithubRepos/main-scripts/src/config/homelab`), two `Paper`
  groups, each rendered with `<Title>` + `<PaperContent>` + `<LinkList>`:

  - **Monitoring** group (`LinkInfo[]`):
    - ntopng — `http://pi3-bplus-1.local:3000` — "Network flow visualization
      and traffic analysis" — `iconName: 'lan'`
    - Grafana — `http://pi3-bplus-1.local:3001` — "Dashboards over router syslog
      (Loki)" — `iconName: 'monitoring'`
  - **Network** group (`LinkInfo[]`):
    - Pi-hole — `http://pi3-bplus-1.local:8080` — "DNS filtering and query logs"
      — `iconName: 'dns'`
    - EdgeRouter X — `https://192.168.0.2` — "Router configuration (EdgeOS)" —
      `iconName: 'router'`

  Optional third group **Test** if you want it surfaced:
    - whoami — `http://pi3-b-1.local:8088` — "Docker health-check container" —
      `iconName: 'check_circle'`

  The Raspberry Pi / router SSH hosts (`pi3-bplus-1.local`, `pi3-b-1.local`,
  `192.168.0.2`) are not web URLs, so they are intentionally left off the links
  page.

## Step 3 — Register the route in navigation

- `src/util/navInfo.ts`
  - Import `homelabPageInfo` from `$routes/homelab/pageInfo`.
  - Add `homelab: homelabPageInfo` to the `navInfo` record (place it logically
    among the other top-level entries).

## Step 4 — Gate the section in the nav drawer

- `src/stores/session/enabledPages.ts`
  - In the `switch (pageTitle)` filter, add a case for `navInfo.homelab.title`
    that returns `settings.config.enabledFeatures.homelabPage`.
    (Matches the `financePage` / `automationPage` cases.)

The existing `enabledPages` store already recomputes whenever
`enabledFeatures` changes (it diffs a JSON string of `enabledFeatures`), so no
other store wiring is required.

## Result

- The homelab entry only appears in the nav drawer when a user's
  `enabledFeatures.homelabPage` is `true`.
- Directly visiting `/homelab` without the flag renders `PageNotFound`.
- The flag defaults to `false` for every user, so no one has access until it is
  enabled manually in the DB.

## Validation (dashboard)

Run from the dashboard repo before considering the task complete:

- `pnpm lint --fix`
- `pnpm check`
- `pnpm test`
