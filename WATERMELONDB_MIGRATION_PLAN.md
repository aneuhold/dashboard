# WatermelonDB Migration Plan

This document outlines the migration from the current LocalData wrapper to a true local-first architecture using WatermelonDB with real-time sync via WebSockets.

## Overview

### Current State

- **Frontend:** SvelteKit + Svelte 5 with a `LocalData` wrapper for browser storage
- **Backend:** NestJS on GCP with MongoDB (`@aneuhold/be-ts-db-lib`)
- **Types:** Shared types in `@aneuhold/core-ts-db-lib` using `ObjectId` (BSON) and custom validators
- **Sync:** Manual fetch-all on load, push on change (no offline support, no conflict resolution)

### Target State

- **Frontend:** WatermelonDB (LokiJS adapter for web) as the local database
- **Backend:** NestJS sync endpoints (`/sync/pull`, `/sync/push`) + WebSocket "nudge" gateway
- **Sync Protocol:** WatermelonDB's standard sync protocol with WebSocket-triggered pulls
- **Result:** True offline-first with near real-time multi-client sync

---

## Phase 1: Backend Sync Endpoints (NestJS)

### 1.1 Add `last_modified` to MongoDB Documents

WatermelonDB sync requires tracking changes. Add to all syncable documents:

```typescript
// In @aneuhold/core-ts-db-lib BaseDocument or per-document
export abstract class SyncableDocument extends BaseDocument {
  /** Server-side timestamp, updated on every write. Indexed. */
  lastModifiedAt: Date = new Date();

  /** Server-side creation timestamp (for created vs updated distinction). */
  serverCreatedAt: Date = new Date();

  /** Soft delete flag (WatermelonDB needs to know about deletions). */
  _deleted: boolean = false;
}
```

Update MongoDB indexes:

```typescript
// In repository setup
collection.createIndex({ lastModifiedAt: 1 });
collection.createIndex({ userId: 1, lastModifiedAt: 1 });
```

### 1.2 Create Sync Controller

```typescript
// src/routes/project/dashboard/Sync.controller.ts
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/ApiKey.guard';

interface PullRequest {
  lastPulledAt: number | null; // Unix timestamp (ms)
  schemaVersion: number;
  migration: {
    from: number;
    tables: string[];
    columns: { table: string; columns: string[] }[];
  } | null;
}

interface PullResponse {
  changes: {
    tasks: { created: object[]; updated: object[]; deleted: string[] };
    userConfigs: { created: object[]; updated: object[]; deleted: string[] };
    nonogramKatanaItems: { created: object[]; updated: object[]; deleted: string[] };
    nonogramKatanaUpgrades: { created: object[]; updated: object[]; deleted: string[] };
  };
  timestamp: number; // Server's current time
}

interface PushRequest {
  changes: {
    tasks?: { created: object[]; updated: object[]; deleted: string[] };
    userConfigs?: { created: object[]; updated: object[]; deleted: string[] };
    nonogramKatanaItems?: { created: object[]; updated: object[]; deleted: string[] };
    nonogramKatanaUpgrades?: { created: object[]; updated: object[]; deleted: string[] };
  };
  lastPulledAt: number;
}

@Controller('project/dashboard/sync')
@UseGuards(ApiKeyGuard)
export class SyncController {
  @Post('pull')
  async pull(@Body() body: PullRequest, @User() userId: string): Promise<PullResponse> {
    const serverNow = Date.now();
    const lastPulledAt = body.lastPulledAt ? new Date(body.lastPulledAt) : null;

    // Query all changes since lastPulledAt for this user
    const changes = {
      tasks: await this.getChanges('tasks', userId, lastPulledAt),
      userConfigs: await this.getChanges('userConfigs', userId, lastPulledAt),
      nonogramKatanaItems: await this.getChanges('nonogramKatanaItems', userId, lastPulledAt),
      nonogramKatanaUpgrades: await this.getChanges('nonogramKatanaUpgrades', userId, lastPulledAt)
    };

    return { changes, timestamp: serverNow };
  }

  @Post('push')
  async push(@Body() body: PushRequest, @User() userId: string): Promise<void> {
    const { changes, lastPulledAt } = body;

    // Check for conflicts: if any record was modified after lastPulledAt, reject
    // Apply changes transactionally
    await this.applyChanges(changes, userId, new Date(lastPulledAt));

    // Notify other clients via WebSocket
    this.syncGateway.notifyChange(userId);
  }

  private async getChanges(collection: string, userId: string, since: Date | null) {
    const repo = this.getRepository(collection);
    const query = since ? { userId, lastModifiedAt: { $gt: since } } : { userId };

    const docs = await repo.find(query);

    // Separate into created, updated, deleted
    const created = docs
      .filter((d) => !since || d.serverCreatedAt > since)
      .filter((d) => !d._deleted);
    const updated = docs.filter((d) => since && d.serverCreatedAt <= since && !d._deleted);
    const deleted = docs.filter((d) => d._deleted).map((d) => d._id.toString());

    return {
      created: created.map((d) => this.toWatermelonRecord(d)),
      updated: updated.map((d) => this.toWatermelonRecord(d)),
      deleted
    };
  }

  private toWatermelonRecord(doc: SyncableDocument): object {
    // Convert MongoDB doc to WatermelonDB raw record format
    // Use snake_case column names to match WatermelonDB schema
    return {
      id: doc._id.toString(),
      user_id: doc.userId.toString()
      // ... map other fields per collection schema
    };
  }
}
```

### 1.3 Create WebSocket Gateway for "Nudge"

This is the key to getting real-time feel without full CRDT complexity:

```typescript
// src/routes/project/dashboard/Sync.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/dashboard-sync',
  cors: { origin: '*' } // Configure properly for production
})
export class SyncGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId>

  async handleConnection(client: Socket) {
    // Authenticate via query param or header
    const userId = await this.authenticate(client);
    if (!userId) {
      client.disconnect();
      return;
    }

    // Track socket
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);
    client.data.userId = userId;

    // Join user-specific room
    client.join(`user:${userId}`);
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.get(userId)?.delete(client.id);
    }
  }

  /**
   * Called by SyncController after push succeeds.
   * Notifies all OTHER clients of this user to pull.
   */
  notifyChange(userId: string, excludeSocketId?: string) {
    // Emit to all sockets in user's room
    this.server.to(`user:${userId}`).emit('sync:pull', {
      timestamp: Date.now()
    });
  }

  /**
   * Also notify collaborators if task sharing changes.
   */
  notifyCollaborators(collaboratorIds: string[]) {
    collaboratorIds.forEach((id) => {
      this.server.to(`user:${id}`).emit('sync:pull', { timestamp: Date.now() });
    });
  }
}
```

### 1.4 Wire Into App Module

```typescript
// src/routes/project/dashboard/Dashboard.module.ts
import { Module } from '@nestjs/common';
import { DashboardController } from './Dashboard.controller';
import { SyncController } from './Sync.controller';
import { SyncGateway } from './Sync.gateway';

@Module({
  controllers: [DashboardController, SyncController],
  providers: [SyncGateway]
})
export class DashboardModule {}
```

Add `@nestjs/websockets` and `socket.io` to backend dependencies:

```bash
pnpm add @nestjs/websockets @nestjs/platform-socket.io socket.io
```

---

## Phase 2: Frontend WatermelonDB Setup (SvelteKit)

### 2.1 Install Dependencies

```bash
pnpm add @nozbe/watermelondb
pnpm add -D @babel/plugin-proposal-decorators @babel/plugin-proposal-class-properties
```

### 2.2 Configure Vite for WatermelonDB

WatermelonDB uses decorators. Update `vite.config.ts`:

```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  optimizeDeps: {
    exclude: ['@nozbe/watermelondb']
  },
  // WatermelonDB needs these
  resolve: {
    alias: {
      '@nozbe/watermelondb': '@nozbe/watermelondb'
    }
  }
});
```

### 2.3 Define WatermelonDB Schema

```typescript
// src/lib/watermelon/schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const dashboardSchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'completed', type: 'boolean' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'parent_task_id', type: 'string', isOptional: true },
        { name: 'start_date', type: 'number', isOptional: true },
        { name: 'due_date', type: 'number', isOptional: true },
        { name: 'category', type: 'string' },
        { name: 'created_date', type: 'number' },
        { name: 'last_updated_date', type: 'number' },
        { name: 'tags_json', type: 'string' }, // JSON stringified
        { name: 'shared_with_json', type: 'string' }, // JSON stringified
        { name: 'recurrence_info_json', type: 'string', isOptional: true },
        { name: 'filter_settings_json', type: 'string' },
        { name: 'sort_settings_json', type: 'string' }
      ]
    }),
    tableSchema({
      name: 'user_configs',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'enable_dev_mode', type: 'boolean' },
        { name: 'auto_task_deletion_days', type: 'number' },
        { name: 'collaborators_json', type: 'string' },
        { name: 'tag_settings_json', type: 'string' },
        { name: 'enabled_features_json', type: 'string' },
        { name: 'task_list_sort_settings_json', type: 'string' },
        { name: 'task_list_filter_settings_json', type: 'string' }
      ]
    }),
    tableSchema({
      name: 'nonogram_katana_items',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'item_name', type: 'string' },
        { name: 'current_amount', type: 'number' },
        { name: 'storage_cap', type: 'number', isOptional: true },
        { name: 'min_desired', type: 'number', isOptional: true },
        { name: 'max_desired', type: 'number', isOptional: true },
        { name: 'priority', type: 'number' }
      ]
    }),
    tableSchema({
      name: 'nonogram_katana_upgrades',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'upgrade_name', type: 'string' },
        { name: 'completed', type: 'boolean' },
        { name: 'current_item_amounts_json', type: 'string' },
        { name: 'priority', type: 'number' }
      ]
    })
  ]
});
```

### 2.4 Define WatermelonDB Models

```typescript
// src/lib/watermelon/models/Task.ts
import { Model } from '@nozbe/watermelondb';
import { field, text, json, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Task extends Model {
  static table = 'tasks';

  @text('user_id') userId!: string;
  @text('title') title!: string;
  @field('completed') completed!: boolean;
  @text('description') description?: string;
  @text('parent_task_id') parentTaskId?: string;
  @date('start_date') startDate?: Date;
  @date('due_date') dueDate?: Date;
  @text('category') category!: string;
  @readonly @date('created_date') createdDate!: Date;
  @date('last_updated_date') lastUpdatedDate!: Date;

  @json('tags_json', (raw) => raw || {}) tags!: Record<string, string[]>;
  @json('shared_with_json', (raw) => raw || []) sharedWith!: string[];
  @json('recurrence_info_json', (raw) => raw) recurrenceInfo?: object;
  @json('filter_settings_json', (raw) => raw || {}) filterSettings!: object;
  @json('sort_settings_json', (raw) => raw || {}) sortSettings!: object;
}
```

```typescript
// src/lib/watermelon/models/index.ts
import Task from './Task';
import UserConfig from './UserConfig';
import NonogramKatanaItem from './NonogramKatanaItem';
import NonogramKatanaUpgrade from './NonogramKatanaUpgrade';

export const modelClasses = [Task, UserConfig, NonogramKatanaItem, NonogramKatanaUpgrade];
```

### 2.5 Initialize Database

```typescript
// src/lib/watermelon/database.ts
import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { dashboardSchema } from './schema';
import { modelClasses } from './models';

let database: Database | null = null;

export function getDatabase(): Database {
  if (!database) {
    const adapter = new LokiJSAdapter({
      schema: dashboardSchema,
      useWebWorker: false,
      useIncrementalIndexedDB: true
    });

    database = new Database({
      adapter,
      modelClasses
    });
  }
  return database;
}
```

---

## Phase 3: Sync Integration

### 3.1 Sync Service

```typescript
// src/lib/watermelon/sync.ts
import { synchronize } from '@nozbe/watermelondb/sync';
import { getDatabase } from './database';

const SYNC_API_BASE = 'https://your-api.com/project/dashboard/sync';

export async function syncDatabase(apiKey: string): Promise<void> {
  const database = getDatabase();

  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
      const response = await fetch(`${SYNC_API_BASE}/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ lastPulledAt, schemaVersion, migration })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const { changes, timestamp } = await response.json();
      return { changes, timestamp };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      const response = await fetch(`${SYNC_API_BASE}/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ changes, lastPulledAt })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
    },
    migrationsEnabledAtVersion: 1
  });
}
```

### 3.2 WebSocket Nudge Client

```typescript
// src/lib/watermelon/syncSocket.ts
import { io, Socket } from 'socket.io-client';
import { syncDatabase } from './sync';

let socket: Socket | null = null;
let syncInProgress = false;

export function connectSyncSocket(apiKey: string): void {
  if (socket?.connected) return;

  socket = io('https://your-api.com/dashboard-sync', {
    query: { apiKey },
    transports: ['websocket']
  });

  socket.on('connect', () => {
    console.log('[Sync] WebSocket connected');
  });

  socket.on('sync:pull', async () => {
    // Debounce/throttle to avoid hammering
    if (syncInProgress) return;
    syncInProgress = true;

    try {
      await syncDatabase(apiKey);
    } finally {
      syncInProgress = false;
    }
  });

  socket.on('disconnect', () => {
    console.log('[Sync] WebSocket disconnected');
  });
}

export function disconnectSyncSocket(): void {
  socket?.disconnect();
  socket = null;
}
```

### 3.3 Svelte 5 Integration

```typescript
// src/lib/watermelon/useTasks.svelte.ts
import { getDatabase } from './database';
import type Task from './models/Task';

/**
 * Reactive task list using Svelte 5 runes.
 * WatermelonDB observables are bridged to $state.
 */
export function useTasks(userId: string) {
  const database = getDatabase();
  let tasks = $state<Task[]>([]);

  $effect(() => {
    const subscription = database
      .get<Task>('tasks')
      .query(Q.where('user_id', userId))
      .observe()
      .subscribe((records) => {
        tasks = records;
      });

    return () => subscription.unsubscribe();
  });

  return {
    get tasks() {
      return tasks;
    }
  };
}
```

### 3.4 Trigger Sync on Local Changes

```typescript
// src/lib/watermelon/autoSync.ts
import { getDatabase } from './database';
import { syncDatabase } from './sync';

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Watches for local changes and triggers sync after a debounce.
 */
export function startAutoSync(apiKey: string): () => void {
  const database = getDatabase();

  const subscription = database.withChangesForTables(['tasks', 'user_configs']).subscribe(() => {
    // Debounce: wait 500ms after last change before syncing
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      syncDatabase(apiKey).catch(console.error);
    }, 500);
  });

  return () => {
    subscription.unsubscribe();
    if (syncTimeout) clearTimeout(syncTimeout);
  };
}
```

---

## Phase 4: Migration Strategy

### 4.1 Data Migration Path

1. **Export existing LocalData** to a JSON structure
2. **First login after upgrade:**
   - If WatermelonDB is empty and LocalData exists:
     - Push LocalData to server via existing API
     - Trigger full sync (initial pull)
     - Clear LocalData
3. **Fallback:** Keep existing API endpoints operational during transition

### 4.2 Incremental Rollout

1. Add feature flag: `enableWatermelonDB` in `DashboardUserConfig.enabledFeatures`
2. If flag is off, use existing LocalData + fetch pattern
3. If flag is on, use WatermelonDB + sync
4. Once stable, migrate all users and remove flag

---

## Phase 5: Conflict Resolution

WatermelonDB uses **Last Write Wins** by default based on the server timestamp. For more control:

```typescript
// In synchronize() options
conflictResolver: (tableName, local, remote, resolved) => {
  // Custom merge logic per table
  if (tableName === 'tasks') {
    // Example: prefer local completed status but remote title
    return {
      ...resolved,
      completed: local.completed || remote.completed,
    };
  }
  return resolved;
},
```

---

## File Structure Summary

```
dashboard/
├── src/
│   └── lib/
│       └── watermelon/
│           ├── database.ts         # DB initialization
│           ├── schema.ts           # Table schemas
│           ├── sync.ts             # Pull/push sync
│           ├── syncSocket.ts       # WebSocket nudge client
│           ├── autoSync.ts         # Local change detection
│           ├── useTasks.svelte.ts  # Svelte 5 reactive hook
│           └── models/
│               ├── index.ts
│               ├── Task.ts
│               ├── UserConfig.ts
│               ├── NonogramKatanaItem.ts
│               └── NonogramKatanaUpgrade.ts

gcloud-backend/
├── src/
│   └── routes/
│       └── project/
│           └── dashboard/
│               ├── Dashboard.controller.ts   # Existing (keep for migration)
│               ├── Dashboard.module.ts
│               ├── Sync.controller.ts        # NEW: Pull/Push endpoints
│               └── Sync.gateway.ts           # NEW: WebSocket nudge
```

---

## Key Benefits

| Feature             | Before                            | After                                  |
| ------------------- | --------------------------------- | -------------------------------------- |
| Offline support     | ❌ None                           | ✅ Full offline read/write             |
| Multi-client sync   | ❌ Manual refresh                 | ✅ Real-time via WebSocket nudge       |
| Conflict resolution | ❌ Last write wins (uncontrolled) | ✅ Controlled LWW with custom resolver |
| Initial load        | Fetch all from server             | Fast from local DB, sync in background |
| Data persistence    | LocalStorage wrapper              | IndexedDB via LokiJS adapter           |

---

## Estimated Effort

| Phase                                | Effort        | Dependencies |
| ------------------------------------ | ------------- | ------------ |
| Phase 1: Backend sync endpoints      | 2-3 days      | None         |
| Phase 2: Frontend WatermelonDB setup | 1-2 days      | Phase 1      |
| Phase 3: Sync integration            | 2-3 days      | Phase 1, 2   |
| Phase 4: Migration & rollout         | 1-2 days      | Phase 1-3    |
| Phase 5: Conflict tuning             | 1 day         | Phase 1-4    |
| **Total**                            | **7-11 days** |              |

---

## References

- [WatermelonDB Sync Frontend](https://watermelondb.dev/docs/Sync/Frontend)
- [WatermelonDB Sync Backend](https://watermelondb.dev/docs/Sync/Backend)
- [NestJS WebSockets](https://docs.nestjs.com/websockets/gateways)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
