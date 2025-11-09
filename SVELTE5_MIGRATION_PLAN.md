# Svelte 5 Migration Plan

## Project: Dashboard

**Branch:** Svelte5Update
**Current State:** Phase 1 approximately 75% complete - all production code migrated to runes, only Storybook examples and parent component event conversions remain

---

## Overview

This document outlines the phased approach to migrating this SvelteKit project from Svelte 4 to Svelte 5, followed by upgrading SMUI from v7 to v8.

**Status:** Phase 1 is mostly complete. All `run()` and `createEventDispatcher` patterns have been migrated in production code. The build currently fails due to SMUI v7 incompatibility with Svelte 5 (expected - requires Phase 2).

---

## ✅ Completed Work Summary

### Files Successfully Migrated to Svelte 5 Runes:

**`run()` → `$derived` or `$effect` conversions:**

1. ✅ `src/routes/finance/+page.svelte` - TR translator and link arrays to `$derived`
2. ✅ `src/components/WeekdaySegmentedButton.svelte` - choices to `$derived`
3. ✅ `src/components/presentational/InputBox.svelte` - to `$effect()`
4. ✅ `src/components/presentational/DatePickerDialog.svelte` - to `$effect()`
5. ✅ `src/components/Tasks/TaskList/TaskRow.svelte` - to `$effect()`
6. ✅ `src/components/Tasks/TaskList/TaskListFilterDialog.svelte` - to `$effect()` (2 instances)
7. ✅ `src/components/Tasks/TaskRecurrence/TaskRecurrenceInfo.svelte` - to `$effect()`
8. ✅ `src/components/Tasks/TaskList/TaskListSortingDialog.svelte` - to `$effect()` (2 instances)
9. ✅ `src/components/singletons/dialogs/SingletonConfirmationDialog.svelte` - to `$effect()`
10. ✅ `src/routes/dev/arch/ArchitectureItemCard.svelte` - 3 `run()` calls → single `$derived` for menuItems

**`createEventDispatcher` → callback props conversions:**

1. ✅ `src/components/presentational/InputBox.svelte` - Added `onsubmit` prop
2. ✅ `src/components/presentational/DatePickerDialog.svelte` - Added `onselected` prop
3. ✅ `src/components/presentational/SquareIconButton.svelte` - Added `onclick` prop
4. ✅ `src/components/Tasks/TaskDate/TaskDateButton.svelte` - Added `onclick` prop
5. ✅ `src/components/Tasks/TaskList/TaskFilterSetting.svelte` - Added `onclick` prop
6. ✅ `src/components/Tasks/TaskTags/GlobalTagRow.svelte` - Added `onOpenEditor` prop
7. ✅ `src/components/Tasks/TaskList/TaskSortSetting.svelte` - Added 4 callback props

**Parent components updated:**

1. ✅ `src/components/Tasks/TaskDate/TaskDateInfo.svelte` - Updated to use callback props
2. ✅ `src/components/Tasks/TaskList/TaskListFilterDialog.svelte` - Updated TaskFilterSetting usages
3. ✅ `src/components/Tasks/TaskTags/GlobalTagSettings.svelte` - Updated GlobalTagRow usages
4. ✅ `src/components/Tasks/TaskList/TaskListSortingDialog.svelte` - Updated TaskSortSetting usages

**Additional fixes:**

- ✅ Fixed syntax error in ArchitectureItemCard.svelte (malformed `{@const}` block)

---

## Phase 1: Svelte 4 → Svelte 5 Migration (75% Complete)

### ⚠️ Current Build Status

The build fails with:

```
"get_current_component" is not exported by "node_modules/svelte/src/internal/index.js"
```

**This is expected** - SMUI v7 uses `svelte/internal` which no longer exists in Svelte 5. You must complete Phase 2 (SMUI v7 → v8) to get builds working again.

### Remaining Work

#### Step 1.1: Finish Storybook Example Files

**Objective:** Complete the last remaining `run()` imports in example/documentation code

- [ ] **1.1.1** Migrate Storybook example files
  - `src/components/Tasks/TaskDetails/SB/SBTaskDetailsExample.svelte` - has `run()` import
  - `src/components/Tasks/TaskList/SB/SBTaskListExample.svelte` - has `run()` import
  - Check what these `run()` calls do and convert to `$derived` or `$effect`

#### Step 1.2: Convert Parent Component Events

**Objective:** Finish converting `createEventDispatcher` in dialog components

These components still use `createEventDispatcher` and need to be converted to callback props:

- [ ] **1.2.1** Convert `TaskListFilterDialog.svelte`
  - Currently dispatches: `updateSettings`, `reset`
  - Add props: `onUpdateSettings?: (settings: DashboardTaskListFilterSettings) => void`
  - Add props: `onReset?: () => void`
  - Find parent component usage and update to use callback props

- [ ] **1.2.2** Convert `TaskListSortingDialog.svelte`
  - Currently dispatches: `updateSettings`, `reset`
  - Add props: `onUpdateSettings?: (settings: DashboardTaskListSortSettings) => void`
  - Add props: `onReset?: () => void`
  - Find parent component usage and update to use callback props

- [ ] **1.2.3** Search for any remaining `createEventDispatcher` usage
  - Run: `grep -r "createEventDispatcher" src/`
  - Migrate any remaining instances

#### Step 1.3: Review Event Directives

**Objective:** Ensure all `on:` directives are converted to event attributes where needed

- [ ] **1.3.1** Search for remaining `on:` directives on custom components
  - Run: `grep -r "on:[a-z]" src/ --include="*.svelte"`
  - These should mostly be SMUI components (will be fixed in Phase 2)
  - Any custom components should use callback props instead

#### Step 1.4: Final Cleanup

**Objective:** Remove all legacy imports and verify code quality

- [ ] **1.4.1** Verify no `svelte/legacy` imports remain
  - Run: `grep -r "from 'svelte/legacy'" src/`
  - Should only see matches in migration plan documentation

- [ ] **1.4.2** Check for any `$:` reactive statements that should be runes
  - Manual review of complex components
  - Look for opportunities to use `$derived.by()` for complex derivations

- [ ] **1.4.3** Address any TypeScript errors
  - Run: `yarn build` (will fail due to SMUI, but check for TS errors)
  - Fix type issues before moving to Phase 2

---

## Phase 2: SMUI v7 → v8 Migration

**Prerequisites:** Phase 1 must be 100% complete

**Current Status:** Not started. Cannot proceed until Phase 1 is complete.

### Step 2.1: Preparation

- [ ] **2.1.1** Review SMUI v8 migration guide
  - URL: https://github.com/hperrin/svelte-material-ui/blob/v8/MIGRATING.md
  - Document breaking changes specific to this project
  - Identify which SMUI components are heavily used in the codebase

- [ ] **2.1.2** Update dependencies
  - Upgrade all `@smui/*` packages to v8 in package.json
  - Update `smui-theme` to v8
  - Run `yarn install`
  - **Note:** Build should succeed after this step

### Step 2.2: Event Renaming (High Priority)

**Key Change:** SMUI v8 events use CamelCase without colons

Examples:

- `SMUISwitch:change` → `SMUISwitchChange`
- `SMUI:component:event` → `SMUIComponentEvent`

- [ ] **2.2.1** Create event mapping for this project
  - Search codebase for SMUI event usage: `grep -r "SMUI[A-Z].*:" src/`
  - Document old → new event name pairs
  - Perform global search and replace

- [ ] **2.2.2** Update all SMUI event handlers
  - Most should be on SMUI components like Checkbox, Switch, Select, etc.
  - Update from `on:SMUIComponent:event` to `on:SMUIComponentEvent`

### Step 2.3: Slots → Snippets (SMUI Components)

**Key Changes in SMUI v8:**

- **TabBar:** `let:tab` → `{#snippet tab(tab)}`
- **Chips Set:** `let:chip` → `{#snippet chip(chip)}`
- **SegmentedButton:** `let:segment` → `{#snippet segment(segment)}`

**Search for usage:**

```bash
grep -r "SegmentedButton" src/ --include="*.svelte"
grep -r "TabBar" src/ --include="*.svelte"
grep -r "Chips" src/ --include="*.svelte"
```

- [ ] **2.3.1** Update SegmentedButton usage
  - Found in: WeekdaySegmentedButton.svelte, TaskSortSetting.svelte
  - Convert `let:segment` slot to `{#snippet segment(segment)}`
  - Update children rendering

- [ ] **2.3.2** Update TabBar usage (if any)
  - Search for instances
  - Convert slot to snippet

- [ ] **2.3.3** Update Chips usage (if any)
  - Search for instances
  - Convert slot to snippet

### Step 2.4: Component-Specific Breaking Changes

- [ ] **2.4.1** Select component
  - No longer defaults `value` to empty string
  - Review all Select usages and ensure proper initialization
  - Search: `grep -r "<Select" src/`

- [ ] **2.4.2** Chips Set
  - Key function must return `string`, not `string | number`
  - Update any key functions to ensure string return type

- [ ] **2.4.3** ClassAdderBuilder removal
  - Search for usage: `grep -r "ClassAdderBuilder" src/`
  - Replace with `ClassAdder` component export
  - Update any custom element implementations

### Step 2.5: Event Modifiers

- [ ] **2.5.1** Check for event modifier usage
  - Search: `grep -r "preventDefault\|stopPropagation" src/`
  - If using SMUI event modifier helpers, update imports
  - New location: `@smui/common/events`

### Step 2.6: Theme Updates

- [ ] **2.6.1** Review theme configuration
  - Check `src/globalStyles/_smui-theme.scss`
  - Note: "Fixation" theme now uses Tahoma font (if using this theme)
  - New "Bubblegum" theme available (optional)

- [ ] **2.6.2** Recompile theme
  - Run: `yarn theme`
  - Verify `static/smui.css` generates correctly
  - Check for Sass deprecation warnings (should be reduced in v8)

### Step 2.7: Build Verification

- [ ] **2.7.1** Attempt production build
  - Run: `yarn build`
  - Should succeed if all migrations complete
  - Fix any compilation errors

- [ ] **2.7.2** Check for warnings
  - Review build output for deprecation warnings
  - Address any SMUI-related warnings

### Step 2.8: Testing & Validation

- [ ] **2.8.1** Start dev server
  - Run: `yarn dev`
  - Check console for errors
  - Verify no SMUI-related warnings

- [ ] **2.8.2** Visual testing
  - Test all pages with SMUI components
  - Verify dialogs render correctly
  - Check buttons, inputs, cards, etc.
  - Test theme application

- [ ] **2.8.3** Interaction testing
  - Test form inputs (Select, Checkbox, Switch, TextField)
  - Test dialogs (open, close, actions)
  - Test navigation components
  - Test responsive behavior

- [ ] **2.8.4** Manual QA of major flows
  - Task creation/editing
  - Settings pages
  - All route navigation
  - Mobile viewport testing

---

## Key Migration Patterns Reference

### Pattern 1: Props

```svelte
<!-- Before (Svelte 4) -->
<script>
  export let count = 0;
  export let name;
</script>

<!-- After (Svelte 5) -->
<script>
  let { count = 0, name } = $props();
</script>
```

### Pattern 2: State

```svelte
<!-- Before -->
<script>
  let count = 0;
</script>

<!-- After -->
<script>
  let count = $state(0);
</script>
```

### Pattern 3: Derived State

```svelte
<!-- Before -->
<script>
  $: doubled = count * 2;
</script>

<!-- After -->
<script>
  let doubled = $derived(count * 2);
</script>
```

### Pattern 4: Effects

```svelte
<!-- Before -->
<script>
  $: {
    console.log(count);
  }
</script>

<!-- After -->
<script>
  $effect(() => {
    console.log(count);
  });
</script>
```

### Pattern 5: Events (Component)

```svelte
<!-- Before (Child) -->
<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>
<button on:click={() => dispatch('increment', 1)}>+</button>

<!-- After (Child) -->
<script>
  let { onincrement } = $props();
</script>
<button onclick={() => onincrement(1)}>+</button>

<!-- Before (Parent) -->
<Counter on:increment={handleIncrement} />

<!-- After (Parent) -->
<Counter onincrement={handleIncrement} />
```

### Pattern 6: Events (DOM)

```svelte
<!-- Before -->
<button on:click={handler}>Click</button>

<!-- After -->
<button onclick={handler}>Click</button>
```

### Pattern 7: Slots → Snippets

```svelte
<!-- After (Child) -->
<script>
  let { header, children } = $props();
</script>

<!-- Before (Child) -->
<slot name="header" />
<slot />
{@render header()}
{@render children()}

<!-- Before (Parent) -->
<Component>
  <div slot="header">Header</div>
  <div>Content</div>
</Component>

<!-- After (Parent) -->
<Component>
  {#snippet header()}
    <div>Header</div>
  {/snippet}
  <div>Content</div>
</Component>
```

---

## Risk Assessment

### High Risk Areas

1. **State management stores** - Extensive use of stores may need careful migration
2. **SMUI components** - Heavy dependency on v7, v8 changes could be breaking
3. **Complex effects** - Lots of `$:` statements that need careful analysis
4. **Recurring tasks logic** - Complex domain logic that must not break

### Mitigation Strategies

- Incremental migration (one pattern at a time)
- Keep Phase 1 and Phase 2 completely separate
- Maintain ability to rollback at any checkpoint

---

## Success Criteria

### Phase 1 Complete When:

- [ ] Zero `svelte/legacy` imports in production code (Storybook examples OK to defer)
- [ ] All `createEventDispatcher` converted to callback props
- [ ] All `on:` directives on custom components converted to callback props
- [ ] TypeScript compilation succeeds (build will still fail due to SMUI v7)
- [ ] Ready to proceed to Phase 2

### Phase 2 Complete When:

- [ ] All SMUI components render correctly
- [ ] Theme applies properly
- [ ] All interactions work
- [ ] No SMUI-related console warnings
- [ ] Build succeeds with zero errors
- [ ] Manual testing passes for all major user flows

---

## Important Notes for Continuation

### Current State Details:

1. **What works:** All production `.svelte` files have been migrated to use Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`)

2. **What's blocking builds:** SMUI v7 uses `svelte/internal` APIs that don't exist in Svelte 5. The error `"get_current_component" is not exported` is expected and cannot be fixed without upgrading to SMUI v8.

3. **Remaining Phase 1 work is minimal:**
   - 2 Storybook example files with `run()` imports
   - 2 dialog components that dispatch events (need callback conversion)
   - Parent components that use those dialogs

4. **Do NOT try to fix the build by downgrading Svelte** - the correct path is to complete Phase 1 cleanup then immediately start Phase 2.

5. **Search commands to verify remaining work:**

   ```bash
   # Find remaining run() imports
   grep -r "from 'svelte/legacy'" src/ --include="*.svelte"

   # Find remaining createEventDispatcher
   grep -r "createEventDispatcher" src/ --include="*.svelte"

   # Find on: directives (mostly SMUI, but check for custom components)
   grep -r "on:[a-z]" src/ --include="*.svelte"
   ```

6. **DocumentMapStoreService:** User noted this is complex - save for last if it needs migration

### Next Steps When Resuming:

1. Complete the 4 remaining Phase 1 tasks (Storybook files + dialog components)
2. Run the verification commands above
3. Immediately proceed to Phase 2 (SMUI upgrade)
4. Don't spend time trying to fix the current build error - it's expected

---

## Questions to Answer Before Starting (Phase 1 Continuation)

1. ✅ Has the migration script already been run? (Yes)
2. ✅ Do we have good test coverage? (No - validation will be via builds and manual QA)
3. ✅ Are there any custom Svelte compiler plugins? (Sentry integration - appears to work fine)
4. ✅ Are there any external libraries that depend on Svelte 4 APIs? (Only SMUI v7 - will fix in Phase 2)
5. ⚠️ What's the current build status? (Fails due to SMUI v7 incompatibility - expected)

## Quick Reference Commands

### Verification Commands:

```bash
# Check for remaining run() imports
grep -r "from 'svelte/legacy'" src/ --include="*.svelte"

# Check for remaining createEventDispatcher
grep -r "createEventDispatcher" src/ --include="*.svelte"

# Check for on: directives on components (need to distinguish SMUI from custom)
grep -r "on:[a-z]" src/ --include="*.svelte" | grep -v "node_modules"

# Find SegmentedButton usage (needs snippet migration in Phase 2)
grep -r "SegmentedButton" src/ --include="*.svelte"
```

### Build Commands:

```bash
# Compile theme (needed before dev/build)
yarn theme

# Development server
yarn dev

# Production build (will fail until Phase 2 complete)
yarn build

# Lint
yarn lint
```

---

## Notes

- The repository uses Yarn 4 - ensure all commands use `yarn`, not `npm`
- Project uses path aliases: `$components`, `$stores`, `$services`, etc.
- Sentry integration exists - verify it works with Svelte 5
- This is a SvelteKit app with `@sveltejs/adapter-static`
