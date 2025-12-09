# TanStack DB + RxDB Migration Plan

## Executive Summary

This document outlines the migration strategy for transitioning the Dashboard application from custom Svelte stores to TanStack DB with RxDB persistence.

**Current State:**

- Custom `DocumentMapStoreService` with lifecycle hooks
- LocalStorage persistence via JSON serialization
- Manual API request queuing
- UUID-based IDs with Zod schemas (recently migrated from ObjectID/BSON)

**Target State:**

- TanStack DB for reactive live queries
- RxDB for IndexedDB persistence and replication
- Shared Zod schemas from `@aneuhold/core-ts-db-lib`
- Simplified codebase with standard libraries

**Timeline:** 6-8 weeks | **Approach:** Gradual migration starting with simpler collections

---

## Table of Contents

1. [Current Architecture](#current-architecture)
2. [Target Architecture](#target-architecture)
3. [Backend Type System](#backend-type-system)
4. [Implementation Plan](#implementation-plan)
5. [Risk Assessment](#risk-assessment)
6. [Testing Strategy](#testing-strategy)

---

## Current Architecture

### State Management

**DocumentMapStoreService Pattern:**

- Abstract base class managing document collections as Svelte stores
- Parent store (`DocumentMap<T>`) manages full collection
- Child stores for individual documents with granular reactivity
- Sophisticated lifecycle hooks for cross-cutting concerns:
  - `beforeDocAddition`, `afterDocAddition`
  - `validateDocDeletion`, `beforeDocDeletion`, `afterDocDeletion`
  - `validateDocUpdate`, `beforeDocUpdate`

**Subscriber Services:**

- TaskRecurrenceService - Handles recurring task logic
- TaskTagsService - Manages per-user tag operations
- TaskSharingService - Coordinates shared task updates

**Key Operations:**

```typescript
interface DocumentMapStore<T> {
  persistChild(childId: string): void;
  updateMany(filter: (doc: T) => boolean, updater: Updater<T>): void;
  upsertMany(upsertInfo: UpsertManyInfo<T>): void;
  addDoc(doc: T): void;
  deleteDoc(docId: string): void;
  deleteMany(docIds: string[]): void;
}
```

### Persistence Layer

**LocalData Service:**

- LocalStorage-based with JSON serialization
- Versioned keys (`v1-taskMap`, `v1-userSettings`, etc.)
- Synchronous operations blocking UI
- 5-10MB storage limit per origin
- No indexing or query optimization

### API Layer

**DashboardAPIService:**

- Custom request queuing for offline resilience
- Batches multiple operations into single API call
- Optimistic updates with rollback via `previousState`
- Manual state synchronization after server responses

---

## Target Architecture

### TanStack DB Layer

**Live Queries:**

- SQL-like fluent API for reactive queries
- Automatic re-execution on data changes
- Type-safe query builder with full TypeScript inference
- Deep reactivity with Svelte 5's fine-grained updates

**Key Features:**

```typescript
const activeTasks = createLiveQueryCollection((q) =>
  q
    .from({ task: tasksCollection })
    .where(({ task }) => eq(task.completed, false))
    .select(({ task }) => ({
      id: task._id,
      title: task.title,
      dueDate: task.dueDate
    }))
);
```

### RxDB Persistence

**IndexedDB Storage:**

- ~10x faster than LocalStorage for reads
- Supports indexes for query optimization
- No size limits (beyond disk space)
- Async operations don't block UI

**Storage Options:**

```typescript
import { getRxStorageIndexedDB } from 'rxdb-premium/plugins/storage-indexeddb';

const db = await createRxDatabase({
  name: 'dashboard',
  storage: getRxStorageIndexedDB()
});
```

**Replication:**

- Built-in conflict resolution (Lamport clocks)
- Multiple replication protocols (WebRTC, GraphQL, REST)
- Automatic retry and queue management
- Replaces custom API queuing

### Schema Definition

**Shared Zod Schemas:**
All schemas will be defined in `@aneuhold/core-ts-db-lib` and used by both frontend (RxDB) and backend (validators).

```typescript
// From @aneuhold/core-ts-db-lib
export const DashboardTaskSchema = z.object({
  _id: z
    .uuidv7()
    .transform((val) => val as UUID)
    .default(() => uuidv7() as UUID),
  userId: z.uuidv7().transform((val) => val as UUID),
  docType: z.literal('task').default('task'),
  title: z.string().default(''),
  completed: z.boolean().default(false),
  description: z.string().nullish(),
  createdDate: z.date().default(() => new Date()),
  lastUpdatedDate: z.date().default(() => new Date()),
  startDate: z.date().nullish(),
  dueDate: z.date().nullish(),
  tags: z
    .record(
      z.uuidv7().transform((id) => id as UUID),
      z.array(z.string()).nullish()
    )
    .default({})
  // ... other fields
});

export type DashboardTask = z.infer<typeof DashboardTaskSchema>;
```

**RxDB Schema Adapter:**
Convert Zod schemas to RxDB JSON Schema format:

```typescript
import { toJsonSchema } from 'zod-to-json-schema';

const rxdbSchema = {
  version: 0,
  primaryKey: '_id',
  type: 'object',
  properties: toJsonSchema(DashboardTaskSchema.omit({ _id: true })),
  required: ['userId', 'title', 'completed']
};
```

---

## Backend Type System

### Current Schema Approach

**Type-First with Zod:**

- All types defined as Zod schemas in `@aneuhold/core-ts-db-lib`
- Backend validators use Zod's `.safeParse()` and `.partial()` for updates
- Frontend imports schemas for type safety and validation

**Document Hierarchy:**

```typescript
BaseDocumentSchema → BaseDocumentWithTypeSchema → DashboardTaskSchema
                                                 → NonogramKatanaItemSchema
                                                 → DashboardUserConfigSchema
```

**Key Properties:**

- `_id`: UUID (generated via `uuidv7()`)
- `userId`: UUID (owner reference)
- `docType`: String literal for discriminated unions
- `createdDate`, `lastUpdatedDate`: Auto-managed dates

### Migration Implications

**Benefits:**

- ✅ Zod schemas already exist - no schema conversion needed
- ✅ UUID compatibility - RxDB works natively with string IDs
- ✅ JSON serialization - no BSON/EJSON complexity
- ✅ Shared validation - single source of truth

**Considerations:**

- RxDB requires JSON Schema format - use `zod-to-json-schema` converter
- Add schema version field for RxDB migrations
- Define indexes in RxDB schema for query optimization

---

## Implementation Plan

### Phase 1: Foundation (Weeks 1-2)

**Goals:**

- Set up RxDB database
- Migrate Nonogram collections (simpler data model)
- Validate approach before tackling tasks

**Tasks:**

1. **Install Dependencies**

```bash
pnpm add @tanstack/db @tanstack/svelte-db @tanstack/db-rxdb \
         rxdb zod zod-to-json-schema
```

2. **Create RxDB Database**

```typescript
// src/lib/db/index.ts
import { createRxDatabase } from 'rxdb/plugins/core';
import { getRxStorageIndexedDB } from 'rxdb-premium/plugins/storage-indexeddb';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

export const db = await createRxDatabase({
  name: 'dashboard',
  storage: wrappedValidateAjvStorage({
    storage: getRxStorageIndexedDB()
  })
});
```

3. **Convert Zod Schemas to RxDB**

```typescript
// src/lib/db/schemas.ts
import { toJsonSchema } from 'zod-to-json-schema';
import { NonogramKatanaItemSchema } from '@aneuhold/core-ts-db-lib';

export const nonogramItemRxDBSchema = {
  version: 0,
  primaryKey: '_id',
  type: 'object' as const,
  properties: toJsonSchema(NonogramKatanaItemSchema.omit({ _id: true })),
  required: ['userId', 'itemName', 'docType'],
  indexes: ['userId', 'itemName']
};
```

4. **Add RxDB Collections**

```typescript
// src/lib/db/index.ts (continued)
await db.addCollections({
  nonogram_items: {
    schema: nonogramItemRxDBSchema
  },
  nonogram_upgrades: {
    schema: nonogramUpgradeRxDBSchema
  }
});
```

5. **Create TanStack Collections**

```typescript
// src/stores/nonogramItems.svelte.ts
import { createCollection } from '@tanstack/svelte-db';
import { rxdbCollectionOptions } from '@tanstack/db-rxdb';
import { db } from '$lib/db';

export const nonogramItemsCollection = createCollection(
  rxdbCollectionOptions({
    rxCollection: db.nonogram_items,
    startSync: true
  })
);
```

6. **Migrate Components**

```svelte
<!-- Before (Svelte 4 style with stores) -->
<script>
  import { nonogramItemMapStore } from '$stores/nonogramItems'

  $: items = $nonogramItemMapStore
</script>

{#each Object.values(items) as item}
  <div>{item.itemName}: {item.currentAmount}</div>
{/each}

<!-- After (Svelte 5 with TanStack DB) -->
<script>
  import { nonogramItemsCollection } from '$stores/nonogramItems.svelte'

  let items = $derived(nonogramItemsCollection.toArray)
</script>

{#each items as item}
  <div>{item.itemName}: {item.currentAmount}</div>
{/each}
```

### Phase 2: Task Collection Migration (Weeks 3-5)

**Complexity Factors:**

- Parent/child task relationships
- Per-user tags and settings
- Recurring task logic
- Sharing functionality
- Lifecycle hooks for validation

**Migration Strategy:**

1. **Schema Setup**

```typescript
export const taskRxDBSchema = {
  version: 0,
  primaryKey: '_id',
  type: 'object' as const,
  properties: toJsonSchema(DashboardTaskSchema.omit({ _id: true })),
  required: ['userId', 'title', 'completed', 'docType'],
  indexes: [
    'userId',
    'completed',
    'dueDate',
    'parentTaskId',
    ['userId', 'completed'] // Compound index
  ]
};
```

2. **Handle Lifecycle Hooks with RxDB Middleware**

RxDB provides hooks for pre/post insert, update, delete:

```typescript
// src/lib/db/middleware/taskHooks.ts
import type { RxCollection } from 'rxdb';
import type { DashboardTask } from '@aneuhold/core-ts-db-lib';

export function setupTaskHooks(collection: RxCollection<DashboardTask>) {
  // Before insert - validation and transformation
  collection.preInsert((doc) => {
    TaskRecurrenceService.validateRecurrence(doc);
    TaskSharingService.validateSharing(doc);
    return doc;
  }, false);

  // After insert - side effects
  collection.postInsert((doc) => {
    TaskTagsService.updateGlobalTags(doc);
  }, false);

  // Before remove - validation
  collection.preRemove((doc) => {
    const childTasks = getChildTasks(doc._id);
    if (childTasks.length > 0) {
      throw new Error('Cannot delete task with children');
    }
  }, false);

  // After remove - cleanup
  collection.postRemove((doc) => {
    TaskRecurrenceService.cleanupRecurrence(doc);
  }, false);
}
```

3. **Implement Live Queries for UI**

```typescript
// Active tasks query
export const activeTasksQuery = createLiveQueryCollection((q) =>
  q
    .from({ task: tasksCollection })
    .where(({ task }) => and(eq(task.completed, false), eq(task.userId, currentUserId)))
    .orderBy(({ task }) => task.dueDate, 'asc')
    .select(({ task }) => ({
      _id: task._id,
      title: task.title,
      dueDate: task.dueDate,
      tags: task.tags
    }))
);

// Subtasks query
export function getSubtasksQuery(parentId: string) {
  return createLiveQueryCollection((q) =>
    q
      .from({ task: tasksCollection })
      .where(({ task }) => eq(task.parentTaskId, parentId))
      .orderBy(({ task }) => task.createdDate, 'asc')
  );
}
```

4. **Migrate Component Reactivity to Svelte 5**

Svelte 5 uses fine-grained reactivity with runes instead of stores:

```svelte
<!-- Before (Svelte 4 + DocumentMapStore) -->
<script>
  import { taskMapStore } from '$stores/tasks'

  let activeTasks
  $: activeTasks = Object.values($taskMapStore).filter(t => !t.completed)
</script>

<!-- After (Svelte 5 + TanStack DB) -->
<script>
  import { activeTasksQuery } from '$stores/tasks.svelte'

  // Deep reactivity - updates when any task property changes
  let activeTasks = $derived(activeTasksQuery.toArray)
</script>

{#each activeTasks as task}
  <TaskItem {task} />
{/each}
```

**Key Svelte 5 Changes:**

- `$state` replaces `let` for reactive state
- `$derived` replaces `$:` for computed values
- `$effect` replaces `$:` for side effects
- Deep reactivity on objects/arrays by default

### Phase 3: API Synchronization (Week 6)

**Replace DashboardAPIService with RxDB Replication:**

1. **Set Up Replication**

```typescript
// src/lib/db/replication.ts
import { replicateRxCollection } from 'rxdb/plugins/replication';

export function setupTaskReplication(collection: RxCollection) {
  return replicateRxCollection({
    collection,
    pull: {
      handler: async (checkpoint, batchSize) => {
        const response = await fetch('/api/dashboard', {
          method: 'POST',
          body: JSON.stringify({
            options: {
              get: {
                tasks: true,
                since: checkpoint?.lastUpdatedDate
              }
            }
          })
        });

        const { tasks } = await response.json();
        return {
          documents: tasks,
          checkpoint: {
            lastUpdatedDate: tasks[tasks.length - 1]?.lastUpdatedDate
          }
        };
      },
      batchSize: 50
    },
    push: {
      handler: async (docs) => {
        await fetch('/api/dashboard', {
          method: 'POST',
          body: JSON.stringify({
            options: {
              update: { tasks: docs }
            }
          })
        });
      },
      batchSize: 50
    }
  });
}
```

2. **Conflict Resolution**

```typescript
pull: {
  handler: async (checkpoint, batchSize) => {
    // ... fetch logic
  },
  modifier: (doc) => {
    // Client wins for optimistic UI
    return doc
  }
}
```

### Phase 4: Cleanup (Weeks 7-8)

1. Remove DocumentMapStoreService and related files
2. Remove LocalData service
3. Remove DashboardAPIService queuing logic
4. Update all component imports
5. Performance testing and optimization
6. Documentation updates

---

## Risk Assessment

### High Risk

**Data Loss During Migration**

- **Mitigation:**
  - Dual-write pattern during transition
  - Export LocalStorage data before migration
  - Keep rollback script for 30 days

**Bundle Size Increase**

- **Risk:** RxDB + TanStack DB adds ~130KB gzipped
- **Mitigation:**
  - Lazy load RxDB on first use
  - Use tree-shaking optimizations
  - Measure and set bundle size budgets

### Medium Risk

**Performance Regression**

- **Risk:** Initial load slower due to IndexedDB setup
- **Mitigation:**
  - Use localstorage-meta-optimizer for faster init
  - Benchmark before/after with realistic data
  - Implement loading states

**Learning Curve**

- **Risk:** Team unfamiliar with TanStack DB query syntax
- **Mitigation:**
  - Start with simple Nonogram collections
  - Pair programming during task migration
  - Document patterns and examples

### Low Risk

**Browser Compatibility**

- **Risk:** IndexedDB issues in older browsers
- **Mitigation:**
  - Target modern browsers (last 2 versions)
  - Graceful degradation to LocalStorage if needed

---

## Testing Strategy

### Unit Tests

Test RxDB schemas and TanStack queries in isolation:

```typescript
import { describe, it, expect } from 'vitest';
import { createRxDatabase } from 'rxdb/plugins/core';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';

describe('Task Collection', () => {
  it('should insert and query tasks', async () => {
    const db = await createRxDatabase({
      name: 'test',
      storage: getRxStorageMemory()
    });

    await db.addCollections({
      tasks: { schema: taskRxDBSchema }
    });

    const task = await db.tasks.insert({
      _id: uuidv7(),
      userId: uuidv7(),
      title: 'Test Task',
      completed: false
    });

    expect(task.title).toBe('Test Task');
  });
});
```

### Integration Tests

Test component integration with Svelte 5 reactivity:

```typescript
import { render, screen } from '@testing-library/svelte';
import TaskList from './TaskList.svelte';

it('should update UI when task completes', async () => {
  const { component } = render(TaskList);

  const task = await tasksCollection.insert({
    title: 'Test',
    completed: false
  });

  expect(screen.getByText('Test')).toBeInTheDocument();

  await task.patch({ completed: true });

  // Svelte 5 reactivity should auto-update
  expect(screen.queryByText('Test')).not.toBeInTheDocument();
});
```

### End-to-End Tests

Test full offline/online sync flows:

```typescript
test('offline task creation syncs when online', async ({ page }) => {
  await page.goto('/');

  // Go offline
  await page.context().setOffline(true);

  // Create task
  await page.fill('[data-testid="task-input"]', 'Offline Task');
  await page.click('[data-testid="add-task"]');

  // Verify task in UI
  await expect(page.locator('text=Offline Task')).toBeVisible();

  // Go online
  await page.context().setOffline(false);

  // Wait for sync
  await page.waitForResponse('/api/dashboard');

  // Verify task persisted
  await page.reload();
  await expect(page.locator('text=Offline Task')).toBeVisible();
});
```

### Performance Tests

Compare before/after metrics:

```typescript
import { performance } from 'perf_hooks';

async function benchmarkReads() {
  const start = performance.now();

  // Read 1000 tasks
  for (let i = 0; i < 1000; i++) {
    await tasksCollection.findOne({ _id: taskIds[i] });
  }

  const end = performance.now();
  console.log(`Read 1000 tasks in ${end - start}ms`);
}
```

**Target Metrics:**

- Initial load: < 2s for 1000 tasks
- Query execution: < 50ms for filtered queries
- UI update latency: < 16ms (60fps)

---

## Rollback Plan

### Immediate Rollback (Within 24 Hours)

If critical issues are discovered immediately after deployment:

1. **Revert Deployment**

```bash
git revert <migration-commit>
pnpm install
pnpm build
```

2. **Restore LocalStorage Data**

```typescript
// Export script (run before migration)
function exportLocalStorageData() {
  const data = {
    tasks: LocalData.getTaskMap(),
    userSettings: LocalData.getUserSettings(),
    nonogramItems: LocalData.getNonogramKatanaItemMap(),
    timestamp: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dashboard-backup-${Date.now()}.json`;
  a.click();
}

// Import script (for rollback)
async function importLocalStorageData(jsonData: string) {
  const data = JSON.parse(jsonData);

  LocalData.setTaskMap(data.tasks);
  LocalData.setUserSettings(data.userSettings);
  LocalData.setNonogramKatanaItemMap(data.nonogramItems);
}
```

### Staged Rollback (1-7 Days)

If issues are discovered during staged rollout:

1. **Feature Flag Rollback**

```typescript
// Use feature flags for gradual rollout
const useTanStackDB = import.meta.env.VITE_USE_TANSTACK_DB === 'true';

if (useTanStackDB) {
  // New TanStack DB code
} else {
  // Old DocumentMapStore code
}
```

2. **Keep Dual Write for 7 Days**

```typescript
async function saveTask(task: DashboardTask) {
  // Write to both systems
  await Promise.all([
    tasksCollection.upsert(task), // New
    LocalData.setTaskMap({ ...oldMap, [task._id]: task }) // Old
  ]);
}
```

### Full Rollback (After 7+ Days)

If fundamental issues are discovered:

1. **Data Migration Script**

```typescript
async function migrateRxDBToLocalStorage() {
  const tasks = await db.tasks.find().exec();
  const taskMap = tasks.reduce((map, task) => {
    map[task._id] = task.toJSON();
    return map;
  }, {} as DashboardTaskMap);

  LocalData.setTaskMap(taskMap);

  // Clear RxDB
  await db.remove();
}
```

2. **Code Restoration**

- Restore DocumentMapStoreService from git history
- Restore LocalData service
- Restore component bindings

---

## Appendix

### Example Queries

**Active Tasks for User**

```typescript
const activeTasks = createLiveQueryCollection((q) =>
  q
    .from({ task: tasksCollection })
    .where(({ task }) => and(eq(task.userId, userId), eq(task.completed, false)))
    .orderBy(({ task }) => task.dueDate, 'asc')
);
```

**Tasks Due Today**

```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);

const tasksDueToday = createLiveQueryCollection((q) =>
  q
    .from({ task: tasksCollection })
    .where(({ task }) =>
      and(gte(task.dueDate, today), lt(task.dueDate, new Date(today.getTime() + 86400000)))
    )
);
```

**Task with Subtasks (Join)**

```typescript
const taskWithSubtasks = createLiveQueryCollection((q) =>
  q
    .from({ parent: tasksCollection })
    .leftJoin({ child: tasksCollection }, ({ parent, child }) => eq(child.parentTaskId, parent._id))
    .select(({ parent, child }) => ({
      task: parent,
      subtasks: [child] // Grouped in TanStack DB
    }))
);
```

### Resources

**Official Documentation:**

- [TanStack DB](https://tanstack.com/db/latest)
- [RxDB](https://rxdb.info/)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/$state)

**Community Examples:**

- [TanStack DB Examples](https://github.com/tanstack/db/tree/main/examples)
- [RxDB Quickstart](https://rxdb.info/quickstart.html)

---

**Migration Plan Version:** 2.0  
**Last Updated:** 2025-01-18  
**Author:** GitHub Copilot
