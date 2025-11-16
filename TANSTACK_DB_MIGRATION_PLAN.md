# TanStack DB with RxDB Collection Migration Plan

**Last Updated**: 2025-01-18

## Executive Summary

This document provides a comprehensive analysis of migrating the Dashboard application from its current custom DocumentMapStoreService architecture to TanStack DB v0 with RxDB Collections. The migration preserves offline-first capabilities, reactive state management, and API synchronization while reducing custom code and leveraging battle-tested libraries.

---

## Table of Contents

1. [Current Architecture Analysis](#current-architecture-analysis)
2. [Target Architecture Overview](#target-architecture-overview)
3. [Backend Type System Analysis](#backend-type-system-analysis)
4. [Migration Options](#migration-options)
5. [Recommended Migration Path](#recommended-migration-path)
6. [Implementation Plan](#implementation-plan)
7. [Risk Assessment](#risk-assessment)
8. [Performance Considerations](#performance-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Rollback Plan](#rollback-plan)

---

## Current Architecture Analysis

### State Management Layer

#### DocumentMapStoreService Pattern

The application uses a sophisticated custom state management system built on Svelte stores:

**Core Components:**

- **DocumentMapStoreService** - Abstract base class managing document collections
- **TaskMapService** - Concrete implementation for task management
- **NonogramKatanaItemMapService** - Game item collection management

**Key Features:**

1. **Parent/Child Store Architecture**
   - Parent store: `DocumentMapStore<T>` manages the entire collection map
   - Child stores: `DocumentChildStore<T>` for individual documents
   - Bi-directional reactivity between parent and children

2. **Lifecycle Hooks System**
   - `beforeMapSet`, `afterMapSet` - Full map replacement
   - `beforeDocAddition`, `afterDocAddition` - Document insertion
   - `validateDocDeletion`, `beforeDocDeletion`, `afterDocDeletion` - Document removal
   - `validateDocUpdate`, `beforeDocUpdate` - Document modification

3. **Subscriber Pattern**
   - TaskRecurrenceService - Handles recurring task logic
   - TaskTagsService - Manages task tagging
   - TaskSharingService - Handles task collaboration
   - Auto-deletion of old completed tasks

4. **Operations**
   - `persistChild(id)` - Persist single document
   - `updateMany(filter, updater)` - Batch updates with filter
   - `upsertMany(upsertInfo)` - Combined insert/update
   - `addDoc(doc)` - Single document insertion
   - `deleteDoc(id)` / `deleteMany(ids)` - Document deletion

### Persistence Layer

#### LocalData Service (EJSON + LocalStorage)

**Current Implementation:**

```typescript
class LocalData {
  // Stores entire DocumentMaps as EJSON-serialized strings
  static setAndGetTaskMap(newTaskMap: DashboardTaskMap): DashboardTaskMap;
  static get taskMap(): DashboardTaskMap | null;

  // Uses BSON's EJSON for complex type preservation
  // - ObjectId serialization
  // - Date type preservation
  // - Deep cloning via serialize/deserialize
}
```

**Serialization Strategy:**

- EJSON.stringify() with `{ relaxed: false }` for strict type preservation
- Stores to localStorage with versioned keys (`v1-taskMap`)
- Deep cloning via parse/stringify cycle for immutability

**Limitations:**

- No indexing capabilities
- No query optimization
- Large datasets cause performance issues
- 5-10MB localStorage quota limits
- Synchronous blocking operations

### API Layer

#### DashboardAPIService

**Request Queuing System:**

```typescript
class DashboardAPIService {
  // Queues API requests for sequential processing
  static queryApi(options: ProjectDashboardOptions): void;

  // Processes queued requests with combined output
  static processApiRequests(): Promise<void>;

  // Applies server responses to local stores
  static processDashboardApiOutput(output: ProjectDashboardOutput): void;
}
```

**Flow:**

1. User action → `queryApi()` adds to queue
2. Queue stored in LocalData for offline resilience
3. `processApiRequests()` combines queue into single API call
4. Server processes insert/update/delete operations
5. `processDashboardApiOutput()` updates local stores
6. LocalData persisted, queue cleared

**Features:**

- Optimistic updates via immediate local store changes
- Offline queue accumulation
- Batch API requests to reduce network calls
- Rollback capability via `previousState` tracking

### Data Models

#### Backend Types (from ts-libs repository)

**DashboardTask** - Primary task entity

```typescript
class DashboardTask extends BaseDocumentWithType {
  _id: ObjectId;
  userId: ObjectId; // Owner
  title: string;
  completed: boolean;
  description?: string;
  createdDate: Date;
  lastUpdatedDate: Date;
  startDate?: Date;
  dueDate?: Date;

  // Collaboration
  sharedWith: ObjectId[];
  assignedTo?: ObjectId;

  // Hierarchy
  parentTaskId?: ObjectId;

  // Recurrence
  recurrenceInfo?: RecurrenceInfo;
  parentRecurringTaskInfo?: ParentRecurringTaskInfo;

  // Organization
  tags: { [userId: string]: string[] };
  category: string;

  // Per-user settings
  filterSettings: DashboardTaskFilterSettings;
  sortSettings: DashboardTaskSortSettings;
}
```

**DashboardUserConfig** - User preferences

```typescript
class DashboardUserConfig extends BaseDocumentWithType {
  _id: ObjectId
  userId: ObjectId
  collaborators: ObjectId[]
  enableDevMode: boolean
  enabledFeatures: { ... }
  autoTaskDeletionDays: number
  tagSettings: DashboardTagSettings
  taskListSortSettings: DashboardTaskListGlobalSortSettings
  taskListFilterSettings: DashboardTaskListGlobalFilterSettings
}
```

**NonogramKatanaItem** - Game item tracking

```typescript
class NonogramKatanaItem extends BaseDocumentWithType {
  _id: ObjectId;
  userId: ObjectId;
  itemName: NonogramKatanaItemName;
  currentAmount: number;
  storageCap?: number;
  minDesired?: number;
  maxDesired?: number;
  priority: number;
}
```

**NonogramKatanaUpgrade** - Game upgrade tracking

```typescript
class NonogramKatanaUpgrade extends BaseDocumentWithType {
  _id: ObjectId;
  userId: ObjectId;
  upgradeName: NonogramKatanaUpgradeName;
  completed: boolean;
  currentItemAmounts: { [key in NonogramKatanaItemName]?: number };
  priority: number;
}
```

**Shared Base Types:**

```typescript
abstract class BaseDocument {
  _id: ObjectId = new ObjectId();
}

abstract class BaseDocumentWithType extends BaseDocument {
  abstract docType: string;
}
```

**Important Constraints:**

- All documents have BSON ObjectId `_id`
- `lastUpdatedDate` used for optimistic concurrency (not revisions)
- Backend uses MongoDB collections with `docType` discriminator
- No backend revision/conflict system - relies on timestamps
- Cascade deletes handled by repository listeners (tasks → subtasks)

### Backend API Patterns

**ProjectDashboard Function** (Digital Ocean/GCloud)

```typescript
interface ProjectDashboardOptions {
  get?: {
    translations?: boolean;
    userConfig?: boolean;
    tasks?: boolean;
    nonogramKatanaItems?: boolean;
    nonogramKatanaUpgrades?: boolean;
  };
  insert?: {
    tasks?: DashboardTask[];
    nonogramKatanaItems?: NonogramKatanaItem[];
    nonogramKatanaUpgrades?: NonogramKatanaUpgrade[];
  };
  update?: {
    userConfig?: DashboardUserConfig;
    tasks?: DashboardTask[];
    nonogramKatanaItems?: NonogramKatanaItem[];
    nonogramKatanaUpgrades?: NonogramKatanaUpgrade[];
  };
  delete?: {
    tasks?: DashboardTask[];
  };
}
```

**Backend Repository Pattern** (MongoDB)

- Singleton repositories per document type
- Validator classes for schema enforcement
- Listener/subscriber system for cross-repo operations
- Cascade delete via `getListenersForUserRepo()`
- Update cleaners remove immutable fields (`createdDate`, `userId`)

---

## Target Architecture Overview

### TanStack DB v0 Capabilities

**Live Query Collections**

```typescript
import { createLiveQuery, createCollection } from '@tanstack/db';

// Reactive SQL-like queries
const tasksQuery = db.tasks
  .from('tasks')
  .where('userId', '==', currentUserId)
  .where('completed', '==', false)
  .orderBy('dueDate', 'asc')
  .select('_id', 'title', 'dueDate');

// Svelte integration
import { useLiveQuery } from '@tanstack/svelte-db';
const tasks = useLiveQuery(tasksQuery);
```

**Features:**

- Automatic reactivity - queries update when data changes
- SQL-like fluent API (from, where, select, join, groupBy, orderBy)
- Supports aggregations and subqueries
- Type-safe query builder
- Framework integration hooks (useLiveQuery for Svelte)

**RxDB Collection Integration**

```typescript
import { rxdbCollectionOptions } from '@tanstack/db-rxdb';

const tasksCollection = createCollection({
  ...rxdbCollectionOptions({
    name: 'tasks',
    storage: getRxStorageIndexedDB(),
    schema: taskSchema,
    startSync: true // Auto-sync between TanStack and RxDB
  })
});
```

**Provided by RxDB:**

- Persistence layer (IndexedDB, OPFS, SQLite, LocalStorage)
- Cross-tab synchronization
- Revision-based conflict resolution
- Replication protocols (WebRTC, GraphQL, CouchDB)
- Observable queries (RxJS-based)

### RxDB Storage Options

| Storage           | Use Case                 | Performance | Size Limit  | Browser Support          |
| ----------------- | ------------------------ | ----------- | ----------- | ------------------------ |
| **IndexedDB**     | Production web apps      | Good        | ~50% disk   | All modern               |
| **OPFS**          | Best browser performance | Excellent   | ~60% disk   | Chrome 86+, Firefox 111+ |
| **LocalStorage**  | Simple/small data        | Poor        | 5-10MB      | Universal                |
| **SQLite (WASM)** | Desktop/mobile apps      | Excellent   | Unlimited   | Electron, Capacitor      |
| **Memory**        | Development/testing      | Excellent   | RAM-limited | Universal                |

**Recommendation for Dashboard:**

- **Primary**: IndexedDB (production-ready, wide support)
- **Future**: OPFS (when Firefox/Safari support improves)
- **Development**: Memory storage for tests

### Schema Validation Options

TanStack DB supports StandardSchema-compatible validators:

**Zod** (Recommended for this project)

```typescript
import { z } from 'zod';
import { ObjectId } from 'bson';

const taskSchema = z
  .object({
    _id: z.instanceof(ObjectId),
    userId: z.instanceof(ObjectId),
    title: z.string().min(1).max(500),
    completed: z.boolean(),
    description: z.string().optional(),
    createdDate: z.date(),
    lastUpdatedDate: z.date(),
    startDate: z.date().optional(),
    dueDate: z.date().optional(),
    sharedWith: z.array(z.instanceof(ObjectId)),
    tags: z.record(z.array(z.string()))
    // ... more fields
  })
  .strict();
```

**Advantages:**

- TypeScript-first design
- Excellent IDE autocomplete
- Transformations and defaults
- Rich error messages
- Already widely used in ecosystem

**Alternatives:**

- **Valibot** - Smaller bundle size (~1KB vs Zod's ~14KB)
- **ArkType** - Runtime type system with better performance
- **Effect Schema** - Functional programming approach

### Conflict Resolution Strategy

**RxDB Revision System:**

```typescript
// Documents have revision strings: "1-9dcca3b8e1a"
// Format: <revision-height>-<random-instance-token>

// Conflict detection
if (docRevision !== expectedRevision) {
  throw 409 CONFLICT
}

// Custom conflict handler
const conflictHandler = {
  isEqual: (docA, docB) => docA.lastUpdatedDate === docB.lastUpdatedDate,
  resolve: (docA, docB) => {
    // Last-write-wins based on lastUpdatedDate
    return docA.lastUpdatedDate > docB.lastUpdatedDate ? docA : docB
  }
}
```

**Current System:**

- Backend uses `lastUpdatedDate` for optimistic concurrency
- No revision tracking
- Frontend rollback via `previousState` comparison

**Migration Path:**

1. Keep `lastUpdatedDate` for backend compatibility
2. Add RxDB revision tracking for local conflict detection
3. Implement custom conflict handler using `lastUpdatedDate`
4. Gradual migration to revision-based backend (optional)

---

## Backend Type System Analysis

### Key Structural Patterns

**Document Hierarchy:**

```
BaseDocument
  └─ BaseDocumentWithType
      ├─ DashboardTask
      ├─ DashboardUserConfig
      ├─ NonogramKatanaItem
      └─ NonogramKatanaUpgrade
```

**Discriminated Union Pattern:**
All dashboard documents stored in single MongoDB collection `dashboard`:

- Filtered by `docType` field
- Repository classes handle type-specific logic
- Validators enforce schema per docType

**Relationship Patterns:**

```
User (1) ──< (N) DashboardTask
              └─ parentTaskId ──> DashboardTask (recursive)
              └─ sharedWith[] ──> User[]
              └─ assignedTo ──> User

User (1) ─ (1) DashboardUserConfig
          └─ collaborators[] ──> User[]

User (1) ──< (N) NonogramKatanaItem
User (1) ──< (N) NonogramKatanaUpgrade
```

### Validation Requirements

**Current Validation (from validators):**

DashboardTask:

- `title`: required string
- `completed`: required boolean
- `sharedWith`: must reference existing users
- `assignedTo`: must reference existing user (if set)
- `parentTaskId`: must reference existing task (if set)
- `recurrenceInfo`: complex nested validation
- `tags`: per-user string arrays

DashboardUserConfig:

- `enableDevMode`: boolean
- `collaborators`: array of valid user ObjectIds
- `autoTaskDeletionDays`: number between 5-90
- `taskListFilterSettings`, `taskListSortSettings`: nested object validation

NonogramKatanaItem/Upgrade:

- `userId`: must reference existing user
- `itemName`/`upgradeName`: enum validation
- Uniqueness constraint: (userId, itemName) or (userId, upgradeName)

### Backend-Controlled Fields

**Immutable After Creation:**

- `_id` - Set by ObjectId constructor
- `userId` - Set on construction, cleaned from updates
- `docType` - Static class property
- `createdDate` - Set on construction, cleaned from updates

**Auto-Updated by Backend:**

- `lastUpdatedDate` - Set on every update by repository updateCleaner

**Critical for Migration:**
RxDB schemas must handle these constraints:

1. Prevent client modification of immutable fields
2. Allow backend to update `lastUpdatedDate` during sync
3. Maintain ObjectId type through serialization
4. Preserve BSON types (Date, ObjectId) in storage

---

## Migration Options

### Option A: Full TanStack DB + RxDB (Recommended)

**Architecture:**

```
[Svelte Components]
       ↓ useLiveQuery
[TanStack DB Live Queries] ← SQL-like reactive queries
       ↓ auto-sync
[RxDB Collections] ← Persistence + conflict resolution
       ↓ IndexedDB
[Browser Storage]
       ↓ replication
[Backend API] (existing ProjectDashboard function)
```

**Mapping Current → Target:**

| Current Component       | TanStack DB Equivalent      | Notes                      |
| ----------------------- | --------------------------- | -------------------------- |
| DocumentMapStoreService | TanStack Collection         | Replace custom store logic |
| LocalData.taskMap       | RxDB Collection + IndexedDB | Automatic persistence      |
| Child stores            | Live query results          | Reactive by default        |
| `persistChild()`        | Auto-persisted on mutation  | No manual persistence      |
| `updateMany()`          | `collection.bulkUpdate()`   | Built-in batch operations  |
| Lifecycle hooks         | RxDB Hooks / Middleware     | Pre/post save hooks        |
| API queue               | RxDB Replication            | Offline-first by design    |

**Implementation Steps:**

1. Install dependencies:

   ```bash
   pnpm add @tanstack/db @tanstack/svelte-db @tanstack/db-rxdb rxdb
   pnpm add zod  # For schema validation
   ```

2. Create RxDB database:

   ```typescript
   // src/lib/db/rxdb-database.ts
   import { createRxDatabase } from 'rxdb';
   import { getRxStorageIndexedDB } from 'rxdb/plugins/storage-indexeddb';

   export const db = await createRxDatabase({
     name: 'dashboard',
     storage: getRxStorageIndexedDB(),
     multiInstance: true, // Cross-tab sync
     eventReduce: true // Performance optimization
   });
   ```

3. Define schemas with Zod:

   ```typescript
   // src/lib/db/schemas/task.schema.ts
   import { z } from 'zod';
   import { ObjectId } from 'bson';

   export const taskSchemaLiteral = z.object({
     _id: z.string().transform((id) => new ObjectId(id)),
     userId: z.string().transform((id) => new ObjectId(id)),
     title: z.string().min(1),
     completed: z.boolean().default(false),
     description: z.string().optional(),
     createdDate: z.date(),
     lastUpdatedDate: z.date()
     // ... all other fields from DashboardTask
   });

   export type TaskDoc = z.infer<typeof taskSchemaLiteral>;
   ```

4. Create TanStack collections:

   ```typescript
   // src/lib/db/collections/tasks.collection.ts
   import { createCollection } from '@tanstack/db';
   import { rxdbCollectionOptions } from '@tanstack/db-rxdb';
   import { taskSchemaLiteral } from '../schemas/task.schema';

   export const tasksCollection = createCollection({
     ...rxdbCollectionOptions({
       name: 'tasks',
       storage: getRxStorageIndexedDB(),
       schema: taskSchemaLiteral,
       startSync: true,

       // Custom persistence handlers
       onInsert: async (doc) => {
         await syncToBackend({ insert: [doc] });
       },
       onUpdate: async (doc) => {
         await syncToBackend({ update: [doc] });
       },
       onDelete: async (doc) => {
         await syncToBackend({ delete: [doc] });
       }
     })
   });
   ```

5. Replace Svelte stores with live queries:

   ```typescript
   // src/routes/tasks/+page.svelte
   <script lang="ts">
   import { useLiveQuery } from '@tanstack/svelte-db'
   import { tasksCollection } from '$lib/db/collections/tasks'
   import { currentUserId } from '$stores/loginState'

   // Reactive query - auto-updates when data changes
   $: tasksQuery = tasksCollection
     .from('tasks')
     .where('userId', '==', $currentUserId)
     .where('completed', '==', false)
     .orderBy('dueDate', 'asc')

   const tasks = useLiveQuery(tasksQuery)

   async function addTask(title: string) {
     await tasksCollection.insert({
       title,
       userId: $currentUserId,
       completed: false,
       createdDate: new Date(),
       lastUpdatedDate: new Date(),
       // Auto-synced to backend via onInsert handler
     })
   }
   </script>

   {#each $tasks as task}
     <TaskCard {task} />
   {/each}
   ```

6. Implement replication for API sync:

   ```typescript
   // src/lib/db/replication/dashboard-replication.ts
   import { replicateRxCollection } from 'rxdb/plugins/replication';

   const replicationState = replicateRxCollection({
     collection: db.tasks,
     replicationIdentifier: 'dashboard-api',
     live: true,
     pull: {
       handler: async (checkpoint) => {
         const response = await DashboardAPIService.getInitialData();
         return {
           documents: response.tasks || [],
           checkpoint: { lastUpdatedDate: new Date() }
         };
       }
     },
     push: {
       handler: async (docs) => {
         await DashboardAPIService.queryApi({
           update: docs.map((d) => d.newDocumentState)
         });
       },
       batchSize: 50,
       modifier: (doc) => {
         // Remove RxDB internal fields before sending
         delete doc._rev;
         delete doc._attachments;
         return doc;
       }
     }
   });
   ```

**Advantages:**

- ✅ Eliminates ~500 lines of custom DocumentMapStoreService code
- ✅ Built-in conflict resolution (no custom previousState tracking)
- ✅ Better performance (IndexedDB vs LocalStorage)
- ✅ Automatic reactivity (no manual store updates)
- ✅ Cross-tab sync out of the box
- ✅ Offline-first by design
- ✅ Battle-tested libraries (RxDB used by major apps)
- ✅ Future-proof (active development, growing ecosystem)

**Challenges:**

- ⚠️ Learning curve for TanStack DB + RxDB APIs
- ⚠️ Need to rewrite all DocumentMapStoreService subclasses
- ⚠️ Migrate subscriber hooks to RxDB middleware
- ⚠️ Bundle size increase (~150KB for RxDB + TanStack DB)
- ⚠️ Must handle ObjectId serialization in RxDB storage
- ⚠️ Backend doesn't use revisions - need custom conflict handler

**Estimated Effort:** 4-6 weeks full-time

---

### Option B: TanStack DB with Custom Persistence

**Architecture:**

```
[Svelte Components]
       ↓ useLiveQuery
[TanStack DB Live Queries] ← SQL-like reactive queries
       ↓ custom persistence
[Custom Storage Adapter] ← Replaces RxDB
       ↓ EJSON serialization
[LocalStorage / IndexedDB] ← Keep existing approach
       ↓ API queue
[Backend API] (existing)
```

**Implementation:**

- Use TanStack DB for queries and reactivity
- Implement custom storage adapter using existing LocalData patterns
- Keep current API queuing system
- Gradual migration path - less disruptive

**Advantages:**

- ✅ Smaller bundle size (~50KB vs ~150KB)
- ✅ Incremental migration - can coexist with current stores
- ✅ Leverage existing LocalData serialization logic
- ✅ Keep familiar API queue system
- ✅ Less code rewrite

**Challenges:**

- ⚠️ Must implement custom TanStack DB storage adapter
- ⚠️ No built-in conflict resolution
- ⚠️ No cross-tab sync
- ⚠️ Still limited by LocalStorage constraints (if not migrating to IndexedDB)
- ⚠️ Less community support (custom adapter)

**Estimated Effort:** 3-4 weeks full-time

---

### Option C: Hybrid Approach (Gradual Migration)

**Phase 1: Add TanStack DB alongside current system**

- Install TanStack DB + RxDB for new features only
- Keep existing DocumentMapStoreService for tasks
- Migrate NonogramKatana collections first (simpler data model)

**Phase 2: Migrate tasks collection**

- Rewrite TaskMapService as TanStack collection
- Migrate TaskRecurrenceService subscribers to RxDB hooks
- Run both systems in parallel with feature flag

**Phase 3: Remove old system**

- Migrate all remaining stores
- Delete DocumentMapStoreService
- Remove LocalData EJSON serialization code

**Advantages:**

- ✅ Lowest risk - can validate in production incrementally
- ✅ Learn RxDB patterns with simpler data first
- ✅ Fallback to old system if issues arise
- ✅ Can ship value while migrating

**Challenges:**

- ⚠️ Maintaining two systems increases complexity
- ⚠️ Longer overall timeline
- ⚠️ Potential for data inconsistency during transition
- ⚠️ Need migration scripts for data format changes

**Estimated Effort:** 6-8 weeks full-time (spread over longer calendar time)

---

## Recommended Migration Path

**Recommendation: Option C (Hybrid Gradual Migration) → Option A (Full TanStack DB)**

### Rationale

1. **Risk Mitigation**: Dashboard is production application with active users
   - Gradual migration allows validation at each step
   - Rollback to old system if critical issues found
   - Users aren't impacted by a "big bang" rewrite

2. **Learning Curve**: RxDB + TanStack DB are new to the team
   - Gain experience with simpler collections first (Nonogram items)
   - Apply learnings to complex task system
   - Validate performance and bundle size impact early

3. **Feature Continuity**: Existing subscriber hooks are sophisticated
   - TaskRecurrenceService logic is critical
   - Auto-deletion based on user settings
   - Can't afford regression in task management

4. **Technical Debt**: Current system has limitations but works
   - LocalStorage size limits not currently hit
   - Cross-tab sync not required yet
   - Can defer migration if ROI unclear

### Migration Stages

#### Stage 1: Foundation & Simple Collections (Week 1-2)

**Goal**: Validate RxDB integration with non-critical data

**Tasks:**

1. Install dependencies and configure bundler

   ```bash
   pnpm add @tanstack/db @tanstack/svelte-db @tanstack/db-rxdb
   pnpm add rxdb zod
   ```

2. Create RxDB database singleton

   ```typescript
   // src/lib/db/index.ts
   export const db = await createRxDatabase({ ... })
   ```

3. Migrate NonogramKatanaItemMapService
   - Create Zod schema for NonogramKatanaItem
   - Implement TanStack collection with RxDB storage
   - Replace store usage in game components
   - Verify persistence and reactivity

4. Migrate NonogramKatanaUpgradeMapService
   - Similar process to items
   - Test cross-collection queries (items + upgrades)

5. Set up migration script
   ```typescript
   // scripts/migrate-nonogram-data.ts
   // Read from LocalData, write to RxDB collections
   ```

**Success Criteria:**

- Game features work identically to before
- IndexedDB contains item/upgrade data
- No performance regression
- Bundle size increase < 200KB

**Rollback**: Keep LocalData storage, feature flag to toggle systems

---

#### Stage 2: Task Collection (Week 3-4)

**Goal**: Migrate core task management to TanStack DB

**Tasks:**

1. Create comprehensive Zod schema for DashboardTask
   - Handle all optional fields
   - Transform ObjectId strings to BSON ObjectId
   - Validate nested RecurrenceInfo structure

2. Implement tasks collection with middleware

   ```typescript
   // src/lib/db/collections/tasks.ts
   export const tasksCollection = createCollection({
     ...rxdbCollectionOptions({
       name: 'tasks',
       schema: taskSchema,
       hooks: {
         preInsert: TaskRecurrenceService.beforeInsert,
         preUpdate: TaskRecurrenceService.beforeUpdate,
         preSave: TaskTagsService.beforeSave
       }
     })
   });
   ```

3. Migrate TaskMapService subscriber logic to RxDB hooks
   - TaskRecurrenceService → preInsert/preUpdate hooks
   - TaskTagsService → preSave hook
   - Auto-deletion → background job or preQuery hook

4. Implement cascade delete for subtasks

   ```typescript
   hooks: {
     preRemove: async (doc) => {
       // Find all subtasks recursively
       const subtasks = await findSubtasks(doc._id);
       await tasksCollection.bulkRemove(subtasks);
     };
   }
   ```

5. Create migration from LocalData taskMap

   ```typescript
   // scripts/migrate-task-data.ts
   const oldTasks = LocalData.taskMap;
   await tasksCollection.bulkInsert(Object.values(oldTasks));
   ```

6. Update task UI components
   - Replace `TaskMapService.getStore()` with `useLiveQuery()`
   - Update mutations to use `tasksCollection.insert/update/remove()`
   - Test filters, sorting, and grouping with live queries

**Success Criteria:**

- All task CRUD operations work
- Recurrence logic functions correctly
- Tag management persists
- Subtask hierarchy maintained
- Parent task deletion cascades
- No data loss during migration

**Rollback**: Feature flag, keep parallel LocalData writes

---

#### Stage 3: API Synchronization (Week 5-6)

**Goal**: Replace custom API queue with RxDB replication

**Tasks:**

1. Implement RxDB replication for tasks

   ```typescript
   const replicationState = replicateRxCollection({
     collection: db.tasks,
     pull: { handler: pullFromBackend },
     push: { handler: pushToBackend },
     live: true,
     retryTime: 5000
   });
   ```

2. Replace DashboardAPIService.queryApi()
   - Mutations now trigger push handler automatically
   - Queue becomes implicit (RxDB handles offline)
   - Remove LocalData.apiRequestQueue

3. Handle conflict resolution

   ```typescript
   const conflictHandler = {
     isEqual: (a, b) => a.lastUpdatedDate === b.lastUpdatedDate,
     resolve: (conflict) => {
       // Last-write-wins using lastUpdatedDate
       return conflict.documentA.lastUpdatedDate > conflict.documentB.lastUpdatedDate
         ? conflict.documentA
         : conflict.documentB;
     }
   };
   ```

4. Migrate DashboardUserConfig to RxDB
   - Create schema
   - Single document per user (not a map)
   - Use `db.userConfig.findOne()` instead of store

5. Update login flow
   - Initial data fetch populates RxDB
   - Start replication after authentication
   - Remove DashboardAPIService.getInitialData() store updates

**Success Criteria:**

- Offline changes sync when online
- Conflicts resolved correctly
- No duplicate API calls
- Network errors don't lose data
- User config changes persist

**Rollback**: Keep API queue system, disable replication

---

#### Stage 4: Cleanup & Optimization (Week 7-8)

**Goal**: Remove old system, optimize bundle and performance

**Tasks:**

1. Delete deprecated code
   - Remove DocumentMapStoreService.ts
   - Delete TaskMapService, NonogramKatanaItemMapService
   - Clean up LocalData unused methods
   - Remove EJSON serialization logic

2. Optimize bundle size
   - Tree-shake unused RxDB plugins
   - Use production builds of TanStack DB
   - Analyze with bundle analyzer
   - Consider Valibot if size critical

3. Add RxDB DevTools (development only)

   ```typescript
   if (import.meta.env.DEV) {
     await import('rxdb/plugins/dev-mode').then((module) => addRxPlugin(module.RxDBDevModePlugin));
   }
   ```

4. Performance testing
   - Load test with 10,000+ tasks
   - Measure query performance vs old system
   - Profile IndexedDB transaction overhead
   - Optimize indexes for common queries

5. Write migration guide for team
   - Document new query patterns
   - Explain RxDB hooks vs old subscribers
   - Provide examples for common operations

6. Update tests
   - Migrate unit tests to use RxDB in-memory storage
   - Add integration tests for replication
   - Test offline/online transitions
   - Verify conflict resolution

**Success Criteria:**

- No DocumentMapStoreService references in codebase
- Bundle size increase < 150KB compressed
- Query performance equal or better
- 100% test coverage maintained
- Documentation complete

---

### Data Migration Strategy

**Approach**: Dual-write then dual-read then cutover

**Phase 1: Dual Write (Week 1-2)**

```typescript
// Feature flag
const USE_RXDB = import.meta.env.VITE_USE_RXDB === 'true';

// Write to both systems
async function addTask(task: DashboardTask) {
  if (USE_RXDB) {
    await tasksCollection.insert(task);
  }
  // Always write to old system
  TaskMapService.getStore().addDoc(task);
}
```

**Phase 2: Dual Read (Week 3-4)**

```typescript
// Read from RxDB first, fallback to old system
function getTasks() {
  if (USE_RXDB) {
    return useLiveQuery(tasksCollection.find());
  }
  return TaskMapService.getStore();
}
```

**Phase 3: One-time Migration (Week 5)**

```typescript
// scripts/migrate-to-rxdb.ts
import LocalData from '$util/LocalData/LocalData';

async function migrateAllData() {
  const taskMap = LocalData.taskMap;
  const itemMap = LocalData.nonogramKatanaItemMap;
  const upgradeMap = LocalData.nonogramKatanaUpgradeMap;

  if (taskMap) {
    await db.tasks.bulkInsert(Object.values(taskMap));
  }
  if (itemMap) {
    await db.items.bulkInsert(Object.values(itemMap));
  }
  if (upgradeMap) {
    await db.upgrades.bulkInsert(Object.values(upgradeMap));
  }

  console.log('Migration complete. Verify data then remove LocalData.');
}
```

**Phase 4: Cutover (Week 6)**

- Set `VITE_USE_RXDB=true` in production
- Monitor for errors (Sentry integration)
- If issues: set to false, investigate, retry
- After 1 week: remove old system code

---

## Risk Assessment

### High-Risk Items

1. **Data Loss During Migration**
   - **Likelihood**: Medium
   - **Impact**: Critical
   - **Mitigation**:
     - Backup LocalData before migration
     - Dual-write period to validate RxDB
     - Automated tests comparing old vs new data
     - Gradual rollout with feature flag
     - User notification to sync before update

2. **Bundle Size Explosion**
   - **Likelihood**: Medium
   - **Impact**: High
   - **Mitigation**:
     - Lazy-load RxDB for non-critical routes
     - Tree-shake unused plugins
     - Use production builds
     - Monitor with bundle analyzer
     - Consider Valibot over Zod

3. **Performance Regression**
   - **Likelihood**: Low-Medium
   - **Impact**: High
   - **Mitigation**:
     - Benchmark before/after with realistic data
     - Optimize IndexedDB indexes
     - Use RxDB query optimizer
     - Profile with Chrome DevTools
     - Load test with 10,000+ documents

### Medium-Risk Items

4. **ObjectId Serialization Issues**
   - **Likelihood**: Medium
   - **Impact**: Medium
   - **Mitigation**:
     - Custom RxDB storage adapter if needed
     - Zod transformers for ObjectId
     - Extensive unit tests
     - Validate against backend MongoDB docs

5. **Conflict Resolution Bugs**
   - **Likelihood**: Medium
   - **Impact**: Medium
   - **Mitigation**:
     - Implement last-write-wins consistently
     - Test concurrent updates across tabs
     - Log conflicts for monitoring
     - User notification on conflicts

6. **Subscriber Hook Migration Errors**
   - **Likelihood**: Medium
   - **Impact**: Medium
   - **Mitigation**:
     - Map old hooks to RxDB equivalents carefully
     - Test TaskRecurrenceService logic thoroughly
     - Validate cascade deletes
     - Integration tests for all hooks

### Low-Risk Items

7. **Cross-Tab Sync Issues**
   - **Likelihood**: Low
   - **Impact**: Low
   - **Mitigation**:
     - Not critical feature currently
     - Can disable if problematic
     - Test with multiple tabs

8. **RxDB Learning Curve**
   - **Likelihood**: High (expected)
   - **Impact**: Low
   - **Mitigation**:
     - Good documentation available
     - Start with simple collections
     - Pair programming sessions
     - Code reviews

---

## Performance Considerations

### Storage Performance Comparison

| Operation       | LocalStorage (current) | IndexedDB (target) | Improvement     |
| --------------- | ---------------------- | ------------------ | --------------- |
| Read 1000 tasks | ~50ms (synchronous)    | ~5ms (async)       | **10x faster**  |
| Write 1 task    | ~10ms                  | ~2ms               | **5x faster**   |
| Bulk write 100  | ~800ms                 | ~50ms              | **16x faster**  |
| Query filter    | O(n) scan              | O(log n) index     | **Significant** |
| Storage limit   | 5-10MB                 | ~50% disk          | **~1000x more** |

**Notes:**

- LocalStorage blocks main thread (synchronous)
- IndexedDB is asynchronous, won't freeze UI
- IndexedDB supports indexes for fast queries
- EJSON parsing overhead eliminated

### Query Performance

**Current (DocumentMapStoreService):**

```typescript
// O(n) filtering on every access
const incompleteTasks = Object.values(taskMap).filter((t) => !t.completed);
// No caching, recomputes every time

// Sorting is O(n log n) every render
incompleteTasks.sort((a, b) => a.dueDate - b.dueDate);
```

**Target (TanStack DB + RxDB):**

```typescript
// Indexed query - O(log n) lookup
const incompleteTasks = db.tasks.find({ completed: false }).sort('dueDate');

// Results cached, only recomputes on data change
// IndexedDB index on 'completed' and 'dueDate'
```

**Expected Improvement:**

- Query time: 50ms → 5ms for 1000 tasks
- No unnecessary rerenders
- Automatic change detection

### Bundle Size Impact

**Current Bundle:**

- Svelte stores: ~5KB
- Custom DocumentMapStoreService: ~3KB
- BSON (EJSON): ~200KB (already included)
- **Total**: ~208KB

**After Migration:**

- TanStack DB: ~30KB
- RxDB core: ~100KB
- RxDB IndexedDB: ~20KB
- Zod: ~14KB (can use Valibot for ~1KB)
- **Total New**: ~164KB
- **Net Change**: -44KB (EJSON removed, new libs added)

**Optimization Strategies:**

1. Lazy load RxDB for non-critical routes
2. Use Valibot instead of Zod (-13KB)
3. Tree-shake unused RxDB plugins
4. Dynamic imports for game collections

**Target**: Keep bundle increase under 100KB compressed

### Memory Usage

**Current:**

- Entire DocumentMap kept in memory
- ~1MB for 1000 tasks with all fields
- Child stores duplicate data

**Target:**

- RxDB uses LRU cache
- Only active queries in memory
- Configurable cache size
- Better for large datasets

---

## Testing Strategy

### Unit Tests

**Test RxDB Collections in Isolation:**

```typescript
// tests/collections/tasks.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createRxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { tasksCollection } from '$lib/db/collections/tasks';

describe('Tasks Collection', () => {
  let db: RxDatabase;

  beforeEach(async () => {
    db = await createRxDatabase({
      name: 'test-db-' + Date.now(),
      storage: getRxStorageMemory() // In-memory for tests
    });
    await tasksCollection.init(db);
  });

  it('should insert and retrieve tasks', async () => {
    const task = await db.tasks.insert({
      title: 'Test Task',
      userId: new ObjectId(),
      completed: false,
      createdDate: new Date(),
      lastUpdatedDate: new Date()
    });

    const found = await db.tasks.findOne(task._id).exec();
    expect(found.title).toBe('Test Task');
  });

  it('should handle recurrence logic on insert', async () => {
    // Test TaskRecurrenceService hook integration
  });

  it('should cascade delete subtasks', async () => {
    // Test cascade delete hook
  });
});
```

### Integration Tests

**Test Data Migration:**

```typescript
// tests/migration/migrate-tasks.test.ts
describe('Task Migration', () => {
  it('should migrate all tasks from LocalData to RxDB', async () => {
    // Populate LocalData with test tasks
    LocalData.taskMap = generateTestTasks(100);

    // Run migration
    await migrateTasksToRxDB();

    // Verify all tasks in RxDB
    const tasks = await db.tasks.find().exec();
    expect(tasks.length).toBe(100);

    // Verify data integrity
    tasks.forEach((task) => {
      expect(task._id).toBeInstanceOf(ObjectId);
      expect(task.lastUpdatedDate).toBeInstanceOf(Date);
    });
  });

  it('should handle ObjectId serialization correctly', async () => {
    const originalTask = { _id: new ObjectId() /* ... */ };
    await db.tasks.insert(originalTask);

    const retrieved = await db.tasks.findOne(originalTask._id).exec();
    expect(retrieved._id).toEqual(originalTask._id);
  });
});
```

### E2E Tests (Playwright)

**Test User Workflows:**

```typescript
// tests/e2e/tasks.spec.ts
import { test, expect } from '@playwright/test';

test('should create and sync task offline', async ({ page, context }) => {
  await page.goto('/tasks');

  // Go offline
  await context.setOffline(true);

  // Create task
  await page.fill('[data-testid="task-title"]', 'Offline Task');
  await page.click('[data-testid="add-task"]');

  // Verify task appears (optimistic update)
  await expect(page.locator('text=Offline Task')).toBeVisible();

  // Go online
  await context.setOffline(false);

  // Wait for sync
  await page.waitForSelector('[data-testid="sync-indicator"]:not(.syncing)');

  // Verify task persisted
  await page.reload();
  await expect(page.locator('text=Offline Task')).toBeVisible();
});

test('should handle conflict resolution', async ({ page, context }) => {
  // Open in two tabs
  const page2 = await context.newPage();

  // Edit same task in both
  await page.fill('[data-testid="task-title"]', 'Edit 1');
  await page2.fill('[data-testid="task-title"]', 'Edit 2');

  await page.click('[data-testid="save"]');
  await page2.click('[data-testid="save"]');

  // Verify last-write-wins
  await expect(page.locator('[data-testid="task-title"]')).toHaveValue('Edit 2');
});
```

### Performance Tests

**Benchmark Queries:**

```typescript
// tests/performance/query-performance.test.ts
describe('Query Performance', () => {
  it('should query 10,000 tasks in < 100ms', async () => {
    // Insert 10k tasks
    await db.tasks.bulkInsert(generateTestTasks(10000));

    // Benchmark query
    const start = performance.now();
    await db.tasks.find({ completed: false }).exec();
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
  });

  it('should handle real-time updates efficiently', async () => {
    const query = db.tasks.find({ completed: false });
    const observable = query.$;

    let updateCount = 0;
    observable.subscribe(() => updateCount++);

    // Trigger 100 updates
    for (let i = 0; i < 100; i++) {
      await db.tasks.insert(generateTestTask());
    }

    // Should debounce or batch updates
    expect(updateCount).toBeLessThan(110); // Allow some overhead
  });
});
```

### Test Coverage Goals

- **Unit Tests**: 90% coverage for collection logic
- **Integration Tests**: All migration paths tested
- **E2E Tests**: Critical user flows (create/edit/delete tasks, offline sync)
- **Performance Tests**: Baseline + regression detection

---

## Rollback Plan

### Immediate Rollback (< 24 hours)

**If critical issues found immediately after deployment:**

1. **Revert environment variable**

   ```bash
   # In production environment
   VITE_USE_RXDB=false

   # Rebuild and deploy
   pnpm build
   ```

2. **Restore from backup**
   - Users who used new system have data in RxDB
   - Old system still writing to LocalData (dual-write)
   - No data loss

3. **Communicate to users**
   - Display notice: "Sync issues detected, please refresh"
   - Clear RxDB database if corrupted
   ```typescript
   await db.remove(); // Next refresh uses LocalData
   ```

### Staged Rollback (1-7 days)

**If issues discovered during gradual rollout:**

1. **Reduce rollout percentage**

   ```typescript
   // Feature flag configuration
   const useRxDB = import.meta.env.VITE_USE_RXDB && Math.random() < 0.1; // 10% of users
   ```

2. **Analyze errors**
   - Review Sentry error reports
   - Check user feedback
   - Compare performance metrics

3. **Fix and retry**
   - Patch critical bugs
   - Test fix in staging
   - Increase rollout percentage gradually

### Full Rollback (> 7 days)

**If fundamental issues require rearchitecture:**

1. **Preserve RxDB data**

   ```typescript
   // Export RxDB data to LocalData format
   const tasks = await db.tasks.find().exec();
   LocalData.taskMap = tasks.reduce((map, task) => {
     map[task._id.toString()] = task;
     return map;
   }, {});
   ```

2. **Remove RxDB dependencies**

   ```bash
   pnpm remove @tanstack/db @tanstack/db-rxdb rxdb
   ```

3. **Restore DocumentMapStoreService**
   - Revert code changes from git
   - Rebuild and deploy

4. **Post-mortem**
   - Document what went wrong
   - Identify root cause
   - Plan alternative approach

### Rollback Decision Criteria

**Trigger rollback if:**

- Data loss > 0.1% of users
- Performance regression > 50%
- Critical bugs affecting > 5% of users
- Offline sync failure rate > 10%
- Conflict resolution errors > 1% of edits

**Do NOT rollback if:**

- Minor UI glitches (can patch)
- Bundle size slightly over target (optimize later)
- Performance regression < 20% (acceptable tradeoff)
- Rare edge case bugs (fix in next release)

---

## Appendix

### TanStack DB vs RxDB Comparison

| Feature                 | TanStack DB         | RxDB                     | Combined        |
| ----------------------- | ------------------- | ------------------------ | --------------- |
| **Query API**           | SQL-like fluent API | MongoDB-like find()      | TanStack on top |
| **Reactivity**          | Framework hooks     | RxJS observables         | Both work       |
| **Storage**             | Abstract interface  | Multiple backends        | RxDB provides   |
| **Replication**         | Abstract            | WebRTC, GraphQL, CouchDB | RxDB provides   |
| **Conflict Resolution** | Not included        | Revision-based           | RxDB provides   |
| **Bundle Size**         | ~30KB               | ~100KB                   | ~130KB total    |
| **TypeScript**          | Excellent           | Good                     | Both type-safe  |
| **Maturity**            | Beta (v0)           | Production (v15+)        | RxDB stable     |

### Schema Example (Full DashboardTask)

```typescript
import { z } from 'zod';
import { ObjectId } from 'bson';

// Helper for ObjectId fields
const objectIdField = z.string().transform((str) => new ObjectId(str));

// Recurrence types
const recurrenceFrequencyType = z.enum(['daily', 'weekly', 'monthly', 'yearly', 'everyXTimeUnit']);

const recurrenceInfo = z.object({
  frequency: z.object({
    type: recurrenceFrequencyType,
    everyXTimeUnit: z
      .object({
        timeUnit: z.enum(['day', 'week', 'month', 'year']),
        x: z.number().int().positive()
      })
      .optional()
  }),
  recurrenceBasis: z.enum(['dueDate', 'completionDate']),
  recurrenceEffect: z.enum(['duplicate', 'moveDueDate'])
});

export const taskSchema = z
  .object({
    // Base fields
    _id: objectIdField,
    userId: objectIdField,
    docType: z.literal('task'),

    // Core fields
    title: z.string().min(1).max(500),
    completed: z.boolean().default(false),
    description: z.string().max(5000).optional(),
    createdDate: z.date(),
    lastUpdatedDate: z.date(),

    // Dates
    startDate: z.date().optional(),
    dueDate: z.date().optional(),

    // Collaboration
    sharedWith: z.array(objectIdField).default([]),
    assignedTo: objectIdField.optional(),

    // Hierarchy
    parentTaskId: objectIdField.optional(),

    // Recurrence
    recurrenceInfo: recurrenceInfo.optional(),
    parentRecurringTaskInfo: z
      .object({
        taskId: objectIdField,
        startDate: z.date().optional(),
        dueDate: z.date().optional()
      })
      .optional(),

    // Organization
    tags: z.record(z.array(z.string())).default({}),
    category: z.string().default('default'),

    // User settings (per-user filter/sort for subtasks)
    filterSettings: z.record(z.any()).default({}), // Complex nested type
    sortSettings: z.record(z.any()).default({})
  })
  .strict();

export type TaskDocument = z.infer<typeof taskSchema>;
```

### RxDB Collection Configuration

```typescript
import { createCollection } from '@tanstack/db';
import { rxdbCollectionOptions } from '@tanstack/db-rxdb';
import { taskSchema } from '../schemas/task.schema';

export const tasksCollection = createCollection({
  ...rxdbCollectionOptions({
    name: 'tasks',
    schema: {
      version: 0,
      primaryKey: '_id',
      type: 'object',
      properties: {
        // Map Zod schema to RxDB JSON Schema
        // RxDB requires JSON Schema format, but TanStack DB handles conversion
      },
      indexes: [
        'userId', // Query by owner
        'completed', // Filter active/completed
        'dueDate', // Sort by due date
        ['userId', 'completed'], // Composite index
        ['userId', 'category'], // Category views
        'parentTaskId' // Subtask queries
      ]
    },
    storage: getRxStorageIndexedDB(),

    // Hooks for business logic
    hooks: {
      preInsert: async (data, doc) => {
        // TaskRecurrenceService logic
        if (data.recurrenceInfo) {
          // Validate recurrence settings
          // Set initial state
        }
        return data;
      },

      preUpdate: async (data, doc) => {
        // Auto-update lastUpdatedDate
        data.lastUpdatedDate = new Date();
        return data;
      },

      preSave: async (data, doc) => {
        // TaskTagsService logic
        // Ensure tags structure is valid
        if (!data.tags[data.userId.toString()]) {
          data.tags[data.userId.toString()] = [];
        }
        return data;
      },

      preRemove: async (doc) => {
        // Cascade delete subtasks
        const subtasks = await db.tasks
          .find({
            parentTaskId: doc._id
          })
          .exec();

        for (const subtask of subtasks) {
          await subtask.remove(); // Recursive cascade
        }
      }
    },

    // Sync configuration
    startSync: true,
    onInsert: async (doc) => {
      await DashboardAPIService.queryApi({ insert: { tasks: [doc] } });
    },
    onUpdate: async (doc) => {
      await DashboardAPIService.queryApi({ update: { tasks: [doc] } });
    },
    onDelete: async (doc) => {
      await DashboardAPIService.queryApi({ delete: { tasks: [doc] } });
    }
  })
});
```

### Migration Script Template

```typescript
// scripts/migrate-to-rxdb.ts
import LocalData from '$util/LocalData/LocalData';
import { db } from '$lib/db';
import { ObjectId } from 'bson';

export async function migrateAllCollections() {
  console.log('Starting migration to RxDB...');

  // 1. Backup current data
  const backup = {
    taskMap: LocalData.taskMap,
    itemMap: LocalData.nonogramKatanaItemMap,
    upgradeMap: LocalData.nonogramKatanaUpgradeMap,
    userSettings: LocalData.userSettings,
    timestamp: new Date().toISOString()
  };

  // Store backup in separate key
  localStorage.setItem('rxdb-migration-backup', JSON.stringify(backup));
  console.log('Backup created');

  // 2. Migrate tasks
  const taskMap = LocalData.taskMap;
  if (taskMap && Object.keys(taskMap).length > 0) {
    console.log(`Migrating ${Object.keys(taskMap).length} tasks...`);

    const tasks = Object.values(taskMap).map((task) => ({
      ...task,
      _id: task._id.toString(), // RxDB stores as string
      userId: task.userId.toString(),
      sharedWith: task.sharedWith.map((id) => id.toString())
      // Transform all ObjectId fields to strings
    }));

    await db.tasks.bulkInsert(tasks);
    console.log('Tasks migrated');
  }

  // 3. Migrate items
  const itemMap = LocalData.nonogramKatanaItemMap;
  if (itemMap && Object.keys(itemMap).length > 0) {
    console.log(`Migrating ${Object.keys(itemMap).length} items...`);
    await db.items.bulkInsert(Object.values(itemMap));
    console.log('Items migrated');
  }

  // 4. Migrate upgrades
  const upgradeMap = LocalData.nonogramKatanaUpgradeMap;
  if (upgradeMap && Object.keys(upgradeMap).length > 0) {
    console.log(`Migrating ${Object.keys(upgradeMap).length} upgrades...`);
    await db.upgrades.bulkInsert(Object.values(upgradeMap));
    console.log('Upgrades migrated');
  }

  // 5. Verify migration
  const verifyResults = await verifyMigration(backup);
  if (!verifyResults.success) {
    throw new Error(`Migration verification failed: ${verifyResults.errors}`);
  }

  console.log('Migration complete and verified');

  // 6. Mark migration as complete
  localStorage.setItem('rxdb-migration-complete', 'true');

  return {
    success: true,
    counts: {
      tasks: Object.keys(taskMap || {}).length,
      items: Object.keys(itemMap || {}).length,
      upgrades: Object.keys(upgradeMap || {}).length
    }
  };
}

async function verifyMigration(backup: any) {
  const errors = [];

  // Verify task count
  const taskCount = await db.tasks.count().exec();
  const expectedTaskCount = Object.keys(backup.taskMap || {}).length;
  if (taskCount !== expectedTaskCount) {
    errors.push(`Task count mismatch: ${taskCount} != ${expectedTaskCount}`);
  }

  // Verify sample data integrity
  const sampleTasks = Object.values(backup.taskMap || {}).slice(0, 10);
  for (const oldTask of sampleTasks) {
    const newTask = await db.tasks.findOne(oldTask._id.toString()).exec();
    if (!newTask) {
      errors.push(`Task ${oldTask._id} not found in RxDB`);
      continue;
    }
    if (newTask.title !== oldTask.title) {
      errors.push(`Task ${oldTask._id} title mismatch`);
    }
  }

  return {
    success: errors.length === 0,
    errors
  };
}
```

### Useful Resources

**TanStack DB:**

- [Official Docs](https://tanstack.com/db/latest)
- [Live Queries Guide](https://tanstack.com/db/latest/docs/guides/live-queries)
- [RxDB Collection Integration](https://tanstack.com/db/latest/docs/collections/rxdb-collection)

**RxDB:**

- [Quickstart](https://rxdb.info/quickstart.html)
- [Replication Guide](https://rxdb.info/replication.html)
- [Conflict Handling](https://rxdb.info/transactions-conflicts-revisions.html)
- [Storage Options](https://rxdb.info/rx-storage.html)

**Validation Libraries:**

- [Zod](https://zod.dev/)
- [Valibot](https://valibot.dev/)

---

## Summary

This migration plan provides a comprehensive roadmap for transitioning the Dashboard application from custom DocumentMapStoreService to TanStack DB with RxDB Collections. The hybrid gradual approach minimizes risk while enabling learning and validation at each stage.

**Key Takeaways:**

1. Start with simple collections (Nonogram) to validate approach
2. Migrate complex task system only after gaining confidence
3. Replace API queue with RxDB replication for better offline support
4. Maintain dual-write capability for safe rollback
5. Expect 6-8 weeks for complete migration with proper testing

**Expected Benefits:**

- Eliminate ~500 lines of custom state management code
- Better performance with IndexedDB
- Automatic reactivity and cross-tab sync
- Built-in conflict resolution
- Future-proof architecture with active library development

**Next Steps:**

1. Review this plan with team
2. Set up development environment with RxDB
3. Begin Stage 1 with Nonogram collections
4. Iterate based on learnings and feedback
