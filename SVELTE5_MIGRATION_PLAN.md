# Svelte 5 Migration Plan

## Project: Dashboard

**Branch:** Svelte5Update
**Current State:** Svelte 5 installed, migration script run, but no manual fixes applied yet

---

## Overview

This document outlines the phased approach to migrating this SvelteKit project from Svelte 4 to Svelte 5, followed by upgrading SMUI from v7 to v8.

**Status:** The automated migration script (`npx sv migrate svelte-5`) has been executed, and `yarn lint --fix` has been run. However, there are still compilation errors and manual migration steps required.

---

## Phase 1: Svelte 4 → Svelte 5 Migration

### Current Errors to Fix

Based on error analysis, we have:

- `goto()` calls without `resolve()` in TaskDetails.svelte (compile errors)
- Likely additional legacy syntax throughout the codebase

### Step 1.1: Core Runes Migration

**Objective:** Ensure all components use runes instead of legacy Svelte 4 syntax

- [ ] **1.1.1** Audit all `.svelte` files for legacy patterns:
  - `export let` → `$props()` destructuring
  - Reactive `let` declarations → `$state()`
  - `$:` reactive statements → `$derived()` or `$effect()`
  - `createEventDispatcher()` → callback props
  - `on:event` → `onevent` attributes

- [ ] **1.1.2** Review migration script output for `run()` imports
  - Check if `run()` from `svelte/legacy` can be replaced with `$derived()` or `$effect()`
  - Document any legitimate uses that must remain

- [ ] **1.1.3** Fix event modifier usage
  - Replace `import { preventDefault } from 'svelte/legacy'` with manual calls
  - Update any `on:click|preventDefault` to use wrapper functions or inline logic

### Step 1.2: Component API Updates

**Objective:** Update component instantiation and lifecycle patterns

- [ ] **1.2.1** Replace `beforeUpdate`/`afterUpdate` with `$effect.pre`/`$effect`
  - Identify all uses of these lifecycle hooks
  - Migrate to appropriate runes with proper dependency tracking

- [ ] **1.2.2** Update any programmatic component mounting
  - Replace `new Component()` with `mount()` from `svelte`
  - Update any `$on`, `$set`, `$destroy` calls

- [ ] **1.2.3** Review and update TypeScript types
  - Replace `SvelteComponent` with `Component` type
  - Update any `ComponentEvents` and `ComponentType` usage

### Step 1.3: Slots → Snippets Migration

**Objective:** Modernize content passing patterns

- [ ] **1.3.1** Identify all components using `<slot>`
  - Create inventory of slot usage patterns
  - Prioritize based on complexity and dependencies

- [ ] **1.3.2** Migrate slots to snippets
  - Default slots → `children` prop + `{@render children()}`
  - Named slots → snippet props
  - Slot props → snippet parameters

- [ ] **1.3.3** Update parent components passing slotted content
  - Convert to `{#snippet}` blocks
  - Ensure proper typing for TypeScript components

### Step 1.4: Event Handling Modernization

**Objective:** Move from directive-based to property-based events

- [ ] **1.4.1** Component events migration
  - Replace all `createEventDispatcher()` with callback props
  - Update parent components to pass functions instead of using `on:` directives
  - Remove `.detail` property access

- [ ] **1.4.2** DOM event handlers
  - Convert `on:click` to `onclick` throughout
  - Handle multiple handlers where needed
  - Update event spreading patterns

### Step 1.5: Bindable Props

**Objective:** Explicitly mark two-way bindings

- [ ] **1.5.1** Identify all `bind:` directive usage on components
  - Audit which props need `$bindable()`
  - Update component prop declarations

- [ ] **1.5.2** Consider alternatives to binding
  - Evaluate if callback props would be clearer
  - Document intentional two-way bindings

### Step 1.6: Compiler & Build Configuration

**Objective:** Update build tooling for Svelte 5 compatibility

- [ ] **1.6.1** Review `svelte.config.js`
  - Remove deprecated options (`hydratable`, `legacy`, etc.)
  - Update any adapter configurations

- [ ] **1.6.2** Update `vite.config.ts`
  - Ensure Svelte 5 Vite plugin compatibility
  - Check Sentry integration still works

- [ ] **1.6.3** Verify TypeScript configuration
  - Check `tsconfig.json` for any Svelte-specific updates needed
  - Ensure types resolve correctly

### Step 1.7: Testing & Validation

**Objective:** Ensure everything works as expected

- [ ] **1.7.1** Fix all compilation errors
  - Resolve `goto()` without `resolve()` errors
  - Fix any type errors
  - Address compiler warnings

- [ ] **1.7.2** Manual QA
  - Test all major user flows
  - Verify transitions/animations work
  - Check responsive behavior
  - Test on multiple browsers

### Step 1.8: Code Cleanup

**Objective:** Remove technical debt and legacy code

- [ ] **1.8.1** Remove all `svelte/legacy` imports
  - Ensure no `run()`, `preventDefault()`, etc. remain

- [ ] **1.8.2** Code review
  - Self-review all changes
  - Ensure consistent patterns throughout
  - Look for opportunities to leverage new features

---

## Phase 2: SMUI v7 → v8 Migration

**Prerequisites:** Phase 1 must be 100% complete

### Step 2.1: Preparation

- [ ] **2.1.1** Review SMUI v8 migration guide
  - Document breaking changes specific to this project
  - Identify components heavily used

- [ ] **2.1.2** Update dependencies
  - Upgrade all `@smui/*` packages to v8
  - Update `smui-theme` to v8
  - Run `yarn install`

### Step 2.2: Event Renaming

**Key Change:** Events now use CamelCase without colons (e.g., `SMUISwitch:change` → `SMUISwitchChange`)

- [ ] **2.2.1** Global search and replace for SMUI events
  - Create mapping of old → new event names
  - Update all event handlers

- [ ] **2.2.2** Remove any MDC-prefixed events
  - These have been completely removed
  - Should already be using SMUI events

### Step 2.3: Event Modifiers

- [ ] **2.3.1** Replace event modifier wrappers
  - Import from `@smui/common/events`
  - Update usage patterns

### Step 2.4: Slots → Snippets (SMUI Components)

**Key Changes:**

- TabBar: `let:tab` → `tab` snippet
- Chips Set: `let:chip` → `chip` snippet
- SegmentedButton: `let:segment` → `segment` snippet

- [ ] **2.4.1** Update TabBar usage
- [ ] **2.4.2** Update Chips usage
- [ ] **2.4.3** Update SegmentedButton usage

### Step 2.5: Component-Specific Changes

- [ ] **2.5.1** Select component
  - No longer defaults value to empty string
  - Update key functions if needed

- [ ] **2.5.2** Chips Set
  - Key function must return `string`, not `string | number`

- [ ] **2.5.3** ClassAdderBuilder
  - Replace with `ClassAdder` component export
  - Update any custom element usage

### Step 2.6: Theme Updates

- [ ] **2.6.1** Review theme changes
  - "Fixation" theme now uses Tahoma font
  - Check if using "Bubblegum" theme (new)

- [ ] **2.6.2** Recompile theme
  - Run `yarn theme`
  - Verify `static/smui.css` is correct

### Step 2.7: Testing & Validation (SMUI)

- [ ] **2.7.1** Visual regression testing
  - Check all SMUI components render correctly
  - Verify theme applies properly

- [ ] **2.7.2** Interaction testing
  - Test form components
  - Verify dialogs, menus, etc. work
  - Check accessibility

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

- [ ] Zero compilation errors
- [ ] Zero runtime errors in console
- [ ] No `svelte/legacy` imports
- [ ] Manual testing passes

### Phase 2 Complete When:

- [ ] All SMUI components render correctly
- [ ] Theme applies properly
- [ ] All interactions work
- [ ] No SMUI-related console warnings
- [ ] Visual regression tests pass

---

## Questions to Answer Before Starting

1. ✅ Has the migration script already been run? (Yes)
2. ✅ Do we have good test coverage? (No, no test coverage)
3. ✅ Are there any custom Svelte compiler plugins? (Sentry integration to verify)
4. ✅ Are there any external libraries that depend on Svelte 4 APIs? (No, besides SMUI)

---

## Notes

- The repository uses Yarn 4 - ensure all commands use `yarn`, not `npm`
- Project uses path aliases: `$components`, `$stores`, `$services`, etc.
- Sentry integration exists - verify it works with Svelte 5
- This is a SvelteKit app with `@sveltejs/adapter-static`
