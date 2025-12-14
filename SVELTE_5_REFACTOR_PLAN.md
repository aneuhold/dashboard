# Svelte 5 Refactor Plan: DocumentMapStoreService

## Objective

Simplify the data persistence layer by leveraging Svelte 5's deep reactivity (`$state`, `$effect`, `$derived`) to replace the complex `writable` store synchronization logic. This removes the need for manual child-store management and "setWithoutPropagation" hacks.

## Core Architecture Changes

### 1. The "Reactive Service" Pattern

- **Current**: `DocumentMapStoreService` manages a plain object map AND a registry of `writable` child stores. Updates require manual propagation and complex hooks.
- **New**: `DocumentMapStoreService` holds a single **deeply reactive** map using `$state`.
  - **Reads**: UI components consume the reactive objects directly.
  - **Simple Writes**: UI mutates objects directly (e.g., `task.completed = true`). `$effect` in the service detects changes and persists to LocalData automatically.
  - **Complex Writes**: UI calls explicit service methods (e.g., `TaskMapService.updateTaskDate(...)`) for operations requiring cascading logic (updating children, recurrence).

### 2. Hook Strategy

- **`beforeDocAddition`**: Retain. Runs inside `addDoc`.
- **`validateDocDeletion`**: Retain. Runs inside `deleteDoc` to identify cascading deletions.
- **`validateDocUpdate`**: **REMOVE**. Replace with explicit service methods to handle side effects explicitly rather than implicitly checking every property change.
- **`setupSubscribers`**: **REMOVE**. Use `$derived` for indexes and `$effect` for persistence.

## Execution Steps

### Phase 1: Base Class Refactor (`src/services/DocumentMapStoreService.ts`)

1.  **Remove Interfaces**: Delete `PersistentChildStore`, `PersistentParentStore`, `SetableStore`.
2.  **Convert State**: Change `documentMap` to `protected documentMap = $state<DocumentMap<T>>({});`.
3.  **Auto-Persistence**: Add an `$effect` in the constructor to call `persistToLocalData` whenever `documentMap` changes.
4.  **Simplify Accessors**:
    - Rename `getDocStore(id)` to `getDoc(id)`.
    - Return `this.documentMap[id]` directly (it is already reactive).
5.  **Refactor Lifecycle Methods**:
    - `addDoc`: Run `beforeDocAddition`, then `this.documentMap[id] = doc`.
    - `deleteDoc`: Run `validateDocDeletion`, then `delete this.documentMap[id]`.

### Phase 2: Subclass Refactor

#### `TaskMapService.ts`

1.  Remove `setupSubscribers` related to updates.
2.  Implement static methods for complex logic (e.g., `updateTaskDate`, `updateRecurrence`).
3.  Update `getTaskStore` to `getTask` wrapping `getDoc`.

#### `NonogramKatanaUpgradeMapService.ts` / `ItemMapService.ts`

1.  Replace manual `nameToIdMap` maintenance with `$derived.by()` inside the class.
2.  Remove `setupSubscribers`.

### Phase 3: UI Component Migration

1.  **Search & Replace**: Find all usages of `getDocStore`, `getTaskStore`, `getItemStore`.
2.  **Update Syntax**:
    - _Old_: `let task = $derived(TaskMapService.getTaskStore(id)); ... $task.completed = true;`
    - _New_: `let task = $derived(TaskMapService.getTask(id)); ... task.completed = true;`
3.  **Complex Actions**:
    - Replace bindings on complex fields (Dates) with event handlers calling the new service methods.

## Code Reference

### New Base Class Skeleton

```typescript
export default abstract class DocumentMapStoreService<T extends BaseDocument> {
  protected documentMap = $state<DocumentMap<T>>({});

  constructor() {
    // Auto-persist to LocalData on ANY change
    $effect.root(() => {
      $effect(() => {
        // This runs automatically when any deep property of documentMap changes
        this.persistToLocalData();
      });
    });
  }

  getDoc(docId: UUID): T | undefined {
    return this.documentMap[docId];
  }

  addDoc(doc: T) {
    const finalDoc = this.beforeDocAddition(doc);
    this.documentMap[finalDoc._id] = finalDoc;
    // DB Persistence can be triggered here or via a separate effect/queue
    this.persistToDb({ insert: [finalDoc] });
  }

  deleteDoc(docId: UUID) {
    const idsToDelete = [docId, ...this.validateDocDeletion(docId)];
    idsToDelete.forEach((id) => delete this.documentMap[id]);
    this.persistToDb({ delete: idsToDelete.map((id) => ({ _id: id }) as T) });
  }

  // Hooks
  protected beforeDocAddition(doc: T): T {
    return doc;
  }
  protected validateDocDeletion(docId: UUID): UUID[] {
    return [];
  }

  // Abstract methods for persistence details
  protected abstract persistToLocalData(): void;
  protected abstract persistToDb(info: DocumentInsertOrUpdateInfo<T>): void;
}
```

### New Subclass Example (`NonogramKatanaUpgradeMapService.ts`)

```typescript
export class NonogramKatanaUpgradeMapService extends DocumentMapStoreService<NonogramKatanaUpgrade> {
  // Automatic Indexing using $derived
  // No need to manually rebuild this map on every change
  private nameToIdMap = $derived.by(() => {
    const map: Record<string, UUID> = {};
    Object.values(this.documentMap).forEach((doc) => {
      if (doc) map[doc.upgradeName] = doc._id;
    });
    return map;
  });

  static getUpgradeByName(name: string) {
    const id = this.instance.nameToIdMap[name];
    return id ? this.instance.getDoc(id) : undefined;
  }
}
```
