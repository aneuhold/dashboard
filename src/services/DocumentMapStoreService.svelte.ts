import type { BaseDocument, DocumentMap } from '@aneuhold/core-ts-db-lib';
import type { UUID } from 'crypto';
import type { Updater } from 'svelte/store';
import { createLogger } from '$util/logging/logger';

const log = createLogger('DocumentMapStoreService.ts');

export type DocumentInsertOrUpdateInfo<T extends BaseDocument> = {
  insert?: T[];
  update?: T[];
  delete?: T[];
};

export type UpsertManyInfo<T> = {
  filter: (currentChild: T) => boolean;
  updater: Updater<T>;
  newDocs: T[];
};

/**
 * A service which can be used to interact with a Svelte store that directly
 * maps to a document type in the database. This is for the situation where
 * multiple documents of the same type are being handled.
 *
 * This service is meant to be used as a singleton.
 */
export default abstract class DocumentMapStoreService<T extends BaseDocument> {
  public mapState: DocumentMap<T> = $state({});

  public addDoc(doc: T): void {
    this.addManyDocs([doc]);
  }

  private addManyDocsWithoutPersist(docs: T[]): T[] {
    docs.forEach((doc) => {
      this.mapState[doc._id] = doc;
    });
    return docs;
  }

  public addManyDocs(docs: T[]): void {
    this.addManyDocsWithoutPersist(docs);

    // Persist
    this.persistToLocalData();
    this.persistToDb({
      insert: docs
    });
  }

  public updateDoc(docId: UUID, updater: Updater<T>): void {
    this.updateManyDocs([docId], updater);
  }

  private updateManyDocsWithoutPersist(
    filterOrDocIds: ((currentDoc: T) => boolean) | UUID[],
    updater: Updater<T>
  ): T[] {
    let docsToUpdate: T[] = [];
    if (Array.isArray(filterOrDocIds)) {
      // It's an array of doc IDs
      const docIds = filterOrDocIds;
      docIds.forEach((docId) => {
        const currentDoc = this.mapState[docId];
        if (!currentDoc) {
          log.error(`Document with ID ${docId} does not exist in the map.`);
          return;
        }
        docsToUpdate.push(updater(currentDoc));
      });
    } else {
      // It's a filter function
      const filter = filterOrDocIds as (currentDoc: T) => boolean;
      docsToUpdate = Object.values(this.mapState).filter(
        (doc): doc is T => doc !== undefined && filter(doc)
      );
      docsToUpdate.forEach(updater);
    }
    return docsToUpdate;
  }

  public updateManyDocs(
    filterOrDocIds: ((currentDoc: T) => boolean) | UUID[],
    updater: Updater<T>
  ): void {
    const docsToUpdate = this.updateManyDocsWithoutPersist(filterOrDocIds, updater);

    // Persist
    this.persistToLocalData();
    this.persistToDb({
      update: docsToUpdate
    });
  }

  public deleteDoc(docId: UUID): void {
    this.deleteManyDocs([docId]);
  }

  public deleteManyDocs(docIds: UUID[]): void {
    const docsToDelete: T[] = [];
    docIds.forEach((id) => {
      const doc = this.mapState[id];
      if (!doc) {
        log.error(`Document with ID ${id} does not exist in the map.`);
        return;
      }
      docsToDelete.push(doc);
      delete this.mapState[id];
    });

    // Persist
    this.persistToLocalData();
    this.persistToDb({
      delete: docsToDelete
    });
  }

  public upsertManyDocs(upsertInfo: UpsertManyInfo<T>): void {
    const { filter, updater, newDocs } = upsertInfo;

    const addedDocs = this.addManyDocsWithoutPersist(newDocs);
    const docsToUpdate = this.updateManyDocsWithoutPersist(filter, updater);

    // Persist
    this.persistToLocalData();
    this.persistToDb({
      insert: addedDocs,
      update: docsToUpdate
    });
  }

  /**
   * Should only be called to initialize or replace the entire map. This does persist to localData
   * but doesn't persist to the DB.
   *
   * @param newMap The new document map
   */
  public setMap(newMap: DocumentMap<T>): void {
    this.mapState = newMap;
    this.persistToLocalData();
  }

  /**
   * Persists the entire map to local storage. This should return a deep copy
   * of the map that is to be persisted.
   */
  protected abstract persistToLocalData(): DocumentMap<T>;

  protected abstract persistToDb(updateInfo: DocumentInsertOrUpdateInfo<T>): void;
}
