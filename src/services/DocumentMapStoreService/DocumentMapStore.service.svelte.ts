import type { ProjectDashboardOptions, ProjectDashboardOutput } from '@aneuhold/core-ts-api-lib';
import { type BaseDocument, type DocumentMap } from '@aneuhold/core-ts-db-lib';
import type { UUID } from 'crypto';
import type { Updater } from 'svelte/store';
import DashboardAPIService from '$services/DashboardAPIService/DashboardAPI.service';
import { createLogger } from '$util/logging/logger';
import type {
  DashboardApiDeleteKey,
  DashboardApiInsertKey,
  DocumentInsertOrUpdateInfo,
  DocumentMapStoreConfig,
  UpsertManyInfo
} from './types';

/**
 * A service which manages a Svelte reactive store that directly maps to a
 * document type in the database. Handles CRUD operations with automatic
 * dual persistence to both local storage and the backend API.
 *
 * Configure via constructor and export the instance as a default export
 * for singleton behavior.
 */
export default class DocumentMapStoreService<T extends BaseDocument> {
  readonly #log = createLogger('DocumentMapStore.service.svelte.ts');
  public mapState: DocumentMap<T> = $state({});
  #config: DocumentMapStoreConfig<T>;

  /**
   * A derived array of all documents in the map. Only recomputes when
   * documents are added, removed, or the entire map is replaced — not
   * when individual document properties change.
   */
  readonly allDocs: T[] = $derived(
    Object.values(this.mapState).filter((doc): doc is T => doc !== undefined)
  );

  constructor(config: DocumentMapStoreConfig<T>) {
    this.#config = config;
  }

  /**
   * Returns a single document by ID, or undefined if not found.
   *
   * @param docId The ID of the document to retrieve
   */
  public getDoc(docId: UUID): T | undefined {
    return this.mapState[docId];
  }

  /**
   * Adds a document to the local map without triggering persistence.
   * Useful for mocks and tests where you want to populate the store
   * without side effects.
   *
   * @param doc The document to add
   */
  public addDocWithoutPersist(doc: T): void {
    this.mapState[doc._id] = doc;
  }

  public addDoc(doc: T, get?: ProjectDashboardOptions['get']): void {
    this.addManyDocs([doc], get);
  }

  public addManyDocs(docs: T[], get?: ProjectDashboardOptions['get']): void {
    docs.forEach((doc) => {
      this.addDocWithoutPersist(doc);
    });
    this.#config.persistToLocalData(this.mapState);
    this.#persistToDb({ insert: docs, get });
  }

  public updateDoc(docId: UUID, mutator: Updater<T>, get?: ProjectDashboardOptions['get']): void {
    this.updateManyDocs([docId], mutator, get);
  }

  public updateManyDocs(
    filterOrDocIds: ((currentDoc: T) => boolean) | UUID[],
    mutator: Updater<T>,
    get?: ProjectDashboardOptions['get']
  ): void {
    const docsToUpdate = this.#updateManyDocsWithoutPersist(filterOrDocIds, mutator);
    this.#config.persistToLocalData(this.mapState);
    this.#persistToDb({ update: docsToUpdate, get });
  }

  public deleteDoc(docId: UUID, get?: ProjectDashboardOptions['get']): void {
    this.deleteManyDocs([docId], get);
  }

  public deleteManyDocs(docIds: UUID[], get?: ProjectDashboardOptions['get']): void {
    docIds.forEach((id) => {
      if (!this.mapState[id]) {
        this.#log.error(`Document with ID ${id} does not exist in the map.`);
        return;
      }
      delete this.mapState[id];
    });
    this.#config.persistToLocalData(this.mapState);
    this.#persistToDb({ delete: docIds, get });
  }

  public upsertManyDocs(upsertInfo: UpsertManyInfo<T>, get?: ProjectDashboardOptions['get']): void {
    const { filter, mutator, newDocs } = upsertInfo;
    newDocs.forEach((doc) => {
      this.addDocWithoutPersist(doc);
    });
    const docsToUpdate = this.#updateManyDocsWithoutPersist(filter, mutator);
    this.#config.persistToLocalData(this.mapState);
    this.#persistToDb({
      insert: newDocs,
      update: docsToUpdate,
      get
    });
  }

  /**
   * Initializes or replaces the entire map. Persists to local data but
   * not to the DB (used when loading data from the API).
   *
   * @param newMap The new document map
   */
  public setMap(newMap: DocumentMap<T>): void {
    this.mapState = newMap;
    this.#config.persistToLocalData(this.mapState);
  }

  /**
   * Applies document operations to local state (without triggering API persistence)
   * and returns the updated API options object with the corresponding
   * insert/update/delete operations for this document type.
   *
   * @param info The insert/update/delete operations to apply
   * @param apiOptions Optional existing options to extend. If omitted, starts fresh.
   */
  public prepareDocsForSave(
    info: DocumentInsertOrUpdateInfo<T>,
    apiOptions: ProjectDashboardOptions = {}
  ): ProjectDashboardOptions {
    if (info.insert) {
      info.insert.forEach((doc) => this.addDocWithoutPersist(doc));
    }
    if (info.delete) {
      info.delete.forEach((id) => delete this.mapState[id]);
    }
    this.#config.persistToLocalData(this.mapState);
    this.#prepareForSave(apiOptions, info);
    return apiOptions;
  }

  /**
   * Applies this map's part of the output of a get request or a WebSocket
   * push.
   *
   * @param output The API output
   */
  public handleApiOutput(output: ProjectDashboardOutput): void {
    this.#config.handleApiOutput(output);
  }

  /**
   * Builds a document map keyed by each document's `_id`.
   *
   * @param documents The documents to put in the map
   */
  protected convertDocumentArrayToMap<TDoc extends BaseDocument>(
    documents: TDoc[]
  ): DocumentMap<TDoc> {
    return documents.reduce<DocumentMap<TDoc>>((map, document) => {
      map[document._id] = document;
      return map;
    }, {});
  }

  #updateManyDocsWithoutPersist(
    filterOrDocIds: ((currentDoc: T) => boolean) | UUID[],
    mutator: Updater<T>
  ): T[] {
    let docsToUpdate: T[] = [];
    if (Array.isArray(filterOrDocIds)) {
      // It's an array of doc IDs
      const docIds = filterOrDocIds;
      docIds.forEach((docId) => {
        const currentDoc = this.mapState[docId];
        if (!currentDoc) {
          this.#log.error(`Document with ID ${docId} does not exist in the map.`);
          return;
        }
        docsToUpdate.push(mutator(currentDoc));
      });
    } else {
      // It's a filter function
      const filter = filterOrDocIds;
      docsToUpdate = this.allDocs.filter(filter);
      docsToUpdate.forEach(mutator);
    }
    return docsToUpdate;
  }

  /**
   * Sends this document type's insert / update / delete operations to the
   * dashboard API, along with a get of the whole document type so the map
   * receives the authoritative server state.
   *
   * @param info The operations to send
   */
  #persistToDb(info: DocumentInsertOrUpdateInfo<T>): void {
    const options: ProjectDashboardOptions = {};
    this.#prepareForSave(options, info);
    options.get = { ...options.get, [this.#config.dashboardApiInsertKey]: true };
    DashboardAPIService.queryApi(options);
  }

  /**
   * Stages this document type's insert / update / delete operations on an API
   * options object instead of sending them immediately.
   *
   * @param options The API options to stage the operations on
   * @param info The operations to stage
   */
  #prepareForSave(options: ProjectDashboardOptions, info: DocumentInsertOrUpdateInfo<T>): void {
    const { dashboardApiInsertKey: key } = this.#config;
    // Each operation is additive in the arrays, so repeated calls don't overwrite each other
    if (info.insert) {
      options.insert = {
        ...options.insert,
        [key]: [...(options.insert?.[key] ?? []), ...info.insert]
      };
    }
    if (info.update) {
      options.update = {
        ...options.update,
        [key]: [...(options.update?.[key] ?? []), ...info.update]
      };
    }
    if (info.delete) {
      if (this.#isDeleteKey(key)) {
        options.delete = {
          ...options.delete,
          [key]: [...(options.delete?.[key] ?? []), ...info.delete]
        };
      } else {
        this.#log.error(`The dashboard API cannot delete ${key}.`);
      }
    }
    if (info.get) {
      options.get = { ...options.get, ...info.get };
    }
  }

  /**
   * Whether the dashboard API can delete documents of the given type.
   *
   * @param key The document type's API key
   */
  #isDeleteKey(key: DashboardApiInsertKey): key is DashboardApiDeleteKey {
    return key === 'tasks';
  }
}
