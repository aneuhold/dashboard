import type { ProjectDashboardOptions, ProjectDashboardOutput } from '@aneuhold/core-ts-api-lib';
import type { BaseDocument, DocumentMap } from '@aneuhold/core-ts-db-lib';
import type { UUID } from 'crypto';
import type { Updater } from 'svelte/store';

/**
 * Everything a {@link DocumentMapStoreService} needs to persist and refresh
 * one document type.
 */
export interface DocumentMapStoreConfig<T extends BaseDocument> {
  /**
   * The API key this document type's insert / update / delete operations are
   * staged under (e.g. 'tasks').
   */
  dashboardApiInsertKey: DashboardApiInsertKey;
  persistToLocalData: (map: DocumentMap<T>) => void;
  /**
   * Applies this map's part of the output of a get request or a WebSocket
   * push.
   */
  handleApiOutput: (output: ProjectDashboardOutput) => void;
}

export type DocumentInsertOrUpdateInfo<T extends BaseDocument> = {
  insert?: T[];
  update?: T[];
  delete?: UUID[];
  get?: ProjectDashboardOptions['get'];
};

export type UpsertManyInfo<T> = {
  filter: (currentChild: T) => boolean;
  mutator: Updater<T>;
  newDocs: T[];
};

/**
 * Names of the dashboard collections that the API can insert / update.
 * Equivalently, the keys of the `insert` payload on `ProjectDashboardOptions`.
 */
export type DashboardApiInsertKey = keyof NonNullable<ProjectDashboardOptions['insert']>;

/**
 * Names of the dashboard collections that the API can delete from.
 */
export type DashboardApiDeleteKey = keyof NonNullable<ProjectDashboardOptions['delete']>;
