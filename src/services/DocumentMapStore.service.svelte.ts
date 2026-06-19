import type { ProjectDashboardOptions } from '@aneuhold/core-ts-api-lib';
import { type BaseDocument, type DocumentMap } from '@aneuhold/core-ts-db-lib';
import type { UUID } from 'crypto';
import type { Updater } from 'svelte/store';
import { createLogger } from '$util/logging/logger';

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

export interface DocumentMapStoreConfig<T extends BaseDocument> {
  persistToLocalData: (map: DocumentMap<T>) => void;
  persistToDb: (updateInfo: DocumentInsertOrUpdateInfo<T>) => void;
  prepareForSave: (options: ProjectDashboardOptions, info: DocumentInsertOrUpdateInfo<T>) => void;
}

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
    this.#config.persistToDb({ insert: docs, get });
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
    this.#config.persistToDb({ update: docsToUpdate, get });
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
    this.#config.persistToDb({ delete: docIds, get });
  }

  public upsertManyDocs(upsertInfo: UpsertManyInfo<T>, get?: ProjectDashboardOptions['get']): void {
    const { filter, mutator, newDocs } = upsertInfo;
    newDocs.forEach((doc) => {
      this.addDocWithoutPersist(doc);
    });
    const docsToUpdate = this.#updateManyDocsWithoutPersist(filter, mutator);
    this.#config.persistToLocalData(this.mapState);
    this.#config.persistToDb({
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
    this.#config.prepareForSave(apiOptions, info);
    return apiOptions;
  }
}
