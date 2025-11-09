# Svelte 5 Migration Plan

## Project: Dashboard

**Branch:** Svelte5Update
**Current State:** Phase 1 COMPLETE ✅ - All production code and Storybook examples migrated to runes. Ready for Phase 2 (SMUI v7 → v8 upgrade).

---

## Overview

This document outlines the phased approach to migrating this SvelteKit project from Svelte 4 to Svelte 5, followed by upgrading SMUI from v7 to v8.

**Status:** Phase 1 is 100% complete. All `run()` and `createEventDispatcher` patterns have been migrated in all code including Storybook examples. The build currently fails due to SMUI v7 incompatibility with Svelte 5 (expected - requires Phase 2).

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
8. ✅ `src/components/Tasks/TaskList/TaskListFilterDialog.svelte` - Added `onUpdateSettings` and `onReset` props
9. ✅ `src/components/Tasks/TaskList/TaskListSortingDialog.svelte` - Added `onUpdateSettings` and `onReset` props

**Parent components updated:**

1. ✅ `src/components/Tasks/TaskDate/TaskDateInfo.svelte` - Updated to use callback props
2. ✅ `src/components/Tasks/TaskList/TaskListFilterDialog.svelte` - Updated TaskFilterSetting usages
3. ✅ `src/components/Tasks/TaskTags/GlobalTagSettings.svelte` - Updated GlobalTagRow usages
4. ✅ `src/components/Tasks/TaskList/TaskListSortingDialog.svelte` - Updated TaskSortSetting usages
5. ✅ `src/components/Tasks/TaskList/TaskListOptions.svelte` - Updated to use callback props for both dialogs

**Storybook example files migrated:**

1. ✅ `src/components/Tasks/TaskDetails/SB/SBTaskDetailsExample.svelte` - Converted `run()` to `$effect()`
2. ✅ `src/components/Tasks/TaskList/SB/SBTaskListExample.svelte` - Converted `run()` to `$effect()`

**Additional fixes:**

- ✅ Fixed syntax error in ArchitectureItemCard.svelte (malformed `{@const}` block)

---

## Phase 1: Svelte 4 → Svelte 5 Migration ✅ COMPLETE

### ✅ All Steps Completed

All `run()` imports have been converted to `$effect()` or `$derived`, all `createEventDispatcher` usage has been converted to callback props, and parent components have been updated accordingly.

**Verification Results:**

- ✅ Zero `svelte/legacy` imports in all code (confirmed via grep)
- ✅ Zero `createEventDispatcher` usage in all code (confirmed via grep)
- ✅ All production code migrated to runes
- ✅ All Storybook example files migrated to runes
- ✅ All dialog components converted to callback props

### Files Migrated in Phase 1 Completion

**Final batch of conversions:**

1. ✅ `src/components/Tasks/TaskDetails/SB/SBTaskDetailsExample.svelte` - `run()` → `$effect()`
2. ✅ `src/components/Tasks/TaskList/SB/SBTaskListExample.svelte` - `run()` → `$effect()`
3. ✅ `src/components/Tasks/TaskList/TaskListFilterDialog.svelte` - `createEventDispatcher` → callback props
4. ✅ `src/components/Tasks/TaskList/TaskListSortingDialog.svelte` - `createEventDispatcher` → callback props
5. ✅ `src/components/Tasks/TaskList/TaskListOptions.svelte` - Updated to use callback props

---

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

---

## Success Criteria

### Phase 1 Complete ✅

- [x] Zero `svelte/legacy` imports in all code (including Storybook examples)
- [x] All `createEventDispatcher` converted to callback props
- [x] All `on:` directives on custom components converted to callback props
- [x] Ready to proceed to Phase 2

**Verified on completion:**

- `grep -r "from 'svelte/legacy'" src/ --include="*.svelte"` returns 0 matches
- `grep -r "createEventDispatcher" src/ --include="*.svelte"` returns 0 matches

### Phase 2 Complete When:

- [ ] All SMUI components render correctly
- [ ] Theme applies properly
- [ ] All interactions work
- [ ] No SMUI-related console warnings
- [ ] Build succeeds with zero errors
- [ ] Manual testing passes for all major user flows

---

## Notes

- The repository uses Yarn 4 - ensure all commands use `yarn`, not `npm`
- Project uses path aliases: `$components`, `$stores`, `$services`, etc.
- Sentry integration exists - verify it works with Svelte 5
- This is a SvelteKit app with `@sveltejs/adapter-static`
