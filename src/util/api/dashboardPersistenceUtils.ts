import type { ProjectDashboardOptions } from '@aneuhold/core-ts-api-lib';
import type { BaseDocument } from '@aneuhold/core-ts-db-lib';
import type { DocumentInsertOrUpdateInfo } from '$services/DocumentMapStoreService.svelte';
import DashboardAPIService from './DashboardAPIService';

type DashboardApiKey = keyof NonNullable<ProjectDashboardOptions['insert']>;

/**
 * Creates a `prepareForSave` function for a dashboard document type that
 * mutates an existing API options object with insert/update/delete operations
 * instead of sending them immediately.
 *
 * @param key The API key name for this document type (e.g. 'tasks')
 */
export function createDashboardPrepareForSave<T extends BaseDocument>(key: DashboardApiKey) {
  return (options: ProjectDashboardOptions, info: DocumentInsertOrUpdateInfo<T>) => {
    if (info.insert) {
      options.insert = { ...options.insert, [key]: info.insert };
    }
    if (info.update) {
      options.update = { ...options.update, [key]: info.update };
    }
    if (info.delete) {
      options.delete = { ...options.delete, [key]: info.delete };
    }
    if (info.get) {
      options.get = { ...options.get, ...info.get };
    }
  };
}

/**
 * Creates a `persistToDb` function for a dashboard document type that
 * sends insert/update/delete operations to the dashboard API.
 *
 * @param key The API key name for this document type (e.g. 'tasks')
 */
export default function createDashboardPersistToDb<T extends BaseDocument>(key: DashboardApiKey) {
  const prepareForSave = createDashboardPrepareForSave<T>(key);
  return (info: DocumentInsertOrUpdateInfo<T>) => {
    const options: ProjectDashboardOptions = {};
    prepareForSave(options, info);
    // Always re-fetch this document type after a mutation so the response
    // handler receives the authoritative server state.
    options.get = { ...options.get, [key]: true };
    DashboardAPIService.queryApi(options);
  };
}
