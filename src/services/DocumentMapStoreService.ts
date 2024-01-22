import type { BaseDocument } from '@aneuhold/core-ts-db-lib';
import { writable, type Readable, type Updater, type Writable } from 'svelte/store';
import { localDataReady } from 'util/LocalData';

/**
 * A store that has persistence capabilities and is a child of a
 * {@link PersistentParentStore}.
 */
export interface PersistentChildStore<T> {
  /**
   * Sets the value of the store without propogating the change to the parent
   * store. This should only be used by the parent store.
   */
  setWithoutPropogation: (value: T) => void;
}

export interface PersistentParentStore<T> {
  /**
   * Persists just the child with the provided ID, then updates the child store
   * with the new previous state.
   */
  persistChild: (childId: string) => void;
  /**
   * Updates many children stores and persists them.
   *
   * @param filter the filter for the children to update. All children that
   * match (returns true) will be propogated to the child stores, then
   * persisted.
   */
  updateMany: (filter: (currentChild: T) => boolean, updater: Updater<T>) => void;
  /**
   * Updates many children stores, persists them, and adds new docs.
   */
  upsertMany: (upsertInfo: UpsertManyInfo<T>) => void;
  addDoc: (doc: T) => void;
  deleteDoc: (docId: string) => void;
}

export interface SetableStore<T> extends Readable<T> {
  set: (value: T) => void;
}

export type DocumentMapStore<T extends BaseDocument> = PersistentParentStore<T> &
  SetableStore<Record<string, T>>;
export type DocumentChildStore<T extends BaseDocument> = PersistentChildStore<T> & Writable<T>;
export type DocumentStore<T extends BaseDocument> = PersistentChildStore<T> & Writable<T>;

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
 * A subscriber to a {@link DocumentMapStore}. This is used to provide hooks
 * into the store to allow for custom logic to be executed when the store is
 * updated.
 *
 * The hooks run in the following order:
 * - The map is set
 *   - `beforeMapSet`
 * - Document addition
 *   - `beforeDocAddition`
 *   - `afterDocAddition`
 * - Document deletion
 *   - `validateDocDeletion`
 *   - `beforeDocDeletion`
 */
export type DocumentMapStoreSubscriber<T extends BaseDocument> = {
  /**
   * A hook that runs before the map is set. This only happens when the entire
   * map is set at once.
   */
  beforeMapSet?: (oldMap: Record<string, T>, newMap: Record<string, T>) => void;
  afterMapSet?: (newMap: Record<string, T>) => void;
  /**
   * A hook which runs before a document is added to the map. This can be used
   * to modify the document before it is added to the map.
   */
  beforeDocAddition?: (map: Record<string, T>, newDoc: T) => T;
  afterDocAddition?: (map: Record<string, T>, newDoc: T) => void;
  /**
   * A hook which runs once before a doc is deleted from the map. This can be
   * used to validate that the doc can be deleted or indicate that other docs
   * should be deleted as well.
   *
   * This runs before the `beforeDocDeletion` hook.
   */
  validateDocDeletion?: (map: Record<string, T>, docToDelete: T) => string[];
  beforeDocDeletion?: (map: Record<string, T>, docToDelete: T) => void;
  /**
   * A hook which runs before a doc is updated in the map. This can be used to
   * indicate that the update to the doc will require other docs to be updated
   * as well, and what should happen to those docs.
   *
   * This runs before the `beforeDocUpdate` hook.
   */
  validateDocUpdate?: (
    map: Record<string, T>,
    oldDoc: T | undefined,
    newDoc: T
  ) => UpsertManyInfo<T> | null;
  /**
   * A hook which runs before any doc is updated. The doc can be modified.
   */
  beforeDocUpdate?: (map: Record<string, T>, oldDoc: T | undefined, newDoc: T) => T;
};

/**
 * A service which can be used to interact with a Svelte store that directly
 * maps to a document type in the database. This is for the situation where
 * multiple documents of the same type are being handled.
 *
 * This service is meant to be used as a singleton.
 *
 * Static members to implement:
 * - `instance`: the singleton instance of the service
 *
 * Static methods to implement
 * - `private getInstance()`: returns the singleton instance of the service or creates
 * it if it does not exist
 * - `getStore`: returns the store for the service
 * - `getDocStore(docId: string)`: returns the specified document store, or
 * creates it if it does not exist
 * - `getMap()`: returns the current `documentMap`
 */
export default abstract class DocumentMapStoreService<T extends BaseDocument> {
  protected documentMap: Record<string, T> = {};
  protected store: DocumentMapStore<T>;
  protected childStores: Record<string, DocumentChildStore<T>> = {};
  protected previousState: Record<string, T> = {};
  /**
   * This should be refactored to be more specific once things are in a working
   * state. That way the forEach loop can be removed.
   */
  protected subscribers: DocumentMapStoreSubscriber<T>[] = [];

  protected constructor() {
    this.store = this.createMapStore();
    this.setupSubscribers();
  }

  /**
   * Initializes subscribers to this service's stores.
   */
  protected abstract setupSubscribers(): void;

  /**
   * Persists the entire map to local storage. This should return a deep copy
   * of the map that is to be persisted.
   *
   * The implementation should persist the `documentMap` property.
   */
  protected abstract persistToLocalData(): Record<string, T>;

  /**
   * Gets the map from local storage.
   */
  protected abstract getFromLocalData(): Record<string, T> | null;

  protected abstract persistToDb(updateInfo: DocumentInsertOrUpdateInfo<T>): void;

  protected getDocStore(docId: string) {
    if (!this.childStores[docId]) {
      this.childStores[docId] = this.createDocStore(docId);
    }
    return this.childStores[docId];
  }

  private createDocStore(docId: string): DocumentChildStore<T> {
    const { subscribe, set } = writable<T>(this.documentMap[docId]);

    const updateDoc = (updater: Updater<T>) => {
      let newDoc = updater(this.documentMap[docId]);
      // Check if this update needs to update other docs as well
      const updateManyArray = this.subscribers.reduce(
        (updateManyArray, subscriber) => {
          if (subscriber.validateDocUpdate) {
            const result = subscriber.validateDocUpdate(
              this.documentMap,
              this.previousState[docId],
              newDoc
            );
            if (result) {
              updateManyArray.push(result);
            }
          }
          return updateManyArray;
        },
        [] as {
          filter: (currentDoc: T) => boolean;
          updater: Updater<T>;
        }[]
      );
      if (updateManyArray.length > 0) {
        this.store.updateMany(
          (currentDoc) => updateManyArray.some((updateMany) => updateMany.filter(currentDoc)),
          (currentDoc) => {
            let newDoc = currentDoc;
            updateManyArray.forEach((updateMany) => {
              newDoc = updateMany.updater(newDoc);
            });
            return newDoc;
          }
        );
        // Return early
        return;
      }

      // Run subscribers
      this.subscribers.forEach((subscriber) => {
        if (subscriber.beforeDocUpdate) {
          newDoc = subscriber.beforeDocUpdate(this.documentMap, this.previousState[docId], newDoc);
        }
      });

      this.documentMap[docId] = newDoc;
      set(newDoc);
      this.store.persistChild(docId);
    };

    return {
      subscribe,
      set: (newDoc: T) => {
        updateDoc(() => newDoc);
      },
      update: (updater: Updater<T>) => {
        updateDoc(updater);
      },
      setWithoutPropogation: (newDoc: T) => {
        set(newDoc);
      }
    };
  }

  private createMapStore(): DocumentMapStore<T> {
    const { subscribe, set } = writable<Record<string, T>>(this.documentMap);

    localDataReady.subscribe((ready) => {
      const localDataMap = this.getFromLocalData();
      if (ready && localDataMap) {
        set(localDataMap);
      }
    });

    const setMap = () => {
      set(this.documentMap);
      this.previousState = this.persistToLocalData();
    };

    const updateManyWithoutPersist = (
      filter: (currentChild: T) => boolean,
      updater: Updater<T>
    ) => {
      const docsToUpdate = Object.values(this.documentMap).filter(filter);
      return docsToUpdate.map((doc) => {
        const docId = doc._id.toString();
        this.documentMap[docId] = updater(doc);
        // Run subscribers
        this.subscribers.forEach((subscriber) => {
          if (subscriber.beforeDocUpdate) {
            subscriber.beforeDocUpdate(
              this.documentMap,
              this.previousState[docId],
              this.documentMap[docId]
            );
          }
        });
        const childStore = this.childStores[docId];
        if (childStore) {
          // Set the child store without propogating the change to the parent
          childStore.setWithoutPropogation(this.documentMap[docId]);
        }
        return this.documentMap[docId];
      });
    };

    const addManyWithoutPersist = (docsToAdd: T[]) => {
      return docsToAdd.map((doc) => {
        const newDoc = this.subscribers.reduce((updateDoc, subscriber) => {
          if (subscriber.beforeDocAddition) {
            return subscriber.beforeDocAddition(this.documentMap, updateDoc);
          }
          return updateDoc;
        }, doc);
        this.documentMap[doc._id.toString()] = newDoc;
        return newDoc;
      });
    };

    return {
      subscribe,
      /**
       * Sets the document map. This should only be used when the store is
       * initialized from data that comes from the backend.
       */
      set: (newMap: Record<string, T>) => {
        this.documentMap = newMap;
        Object.entries(this.childStores).forEach(([docId, store]) => {
          if (!this.documentMap[docId]) {
            delete this.childStores[docId];
          } else {
            store.setWithoutPropogation(this.documentMap[docId]);
          }
        });
        setMap();
        this.subscribers.forEach((subscriber) => {
          if (subscriber.afterMapSet) {
            subscriber.afterMapSet(this.documentMap);
          }
        });
      },
      persistChild: (childId: string) => {
        this.previousState = this.persistToLocalData();
        this.persistToDb({
          update: [this.documentMap[childId]]
        });
      },
      updateMany: (filter: (currentChild: T) => boolean, updater: Updater<T>) => {
        const docsToUpdate = updateManyWithoutPersist(filter, updater);
        // Get the new previous state
        this.previousState = this.persistToLocalData();
        // Persist the changes to the DB
        this.persistToDb({
          update: docsToUpdate
        });
      },
      upsertMany: (upsertInfo: UpsertManyInfo<T>) => {
        const { filter, updater } = upsertInfo;
        let { newDocs } = upsertInfo;
        newDocs = addManyWithoutPersist(newDocs);
        const docsToUpdate = updateManyWithoutPersist(filter, updater);
        setMap();
        docsToUpdate.forEach((doc) => {
          this.subscribers.forEach((subscriber) => {
            if (subscriber.afterDocAddition) {
              subscriber.afterDocAddition(this.documentMap, doc);
            }
          });
        });
        this.persistToDb({
          insert: newDocs,
          update: docsToUpdate
        });
      },
      addDoc: (doc: T) => {
        const updatedDoc = addManyWithoutPersist([doc])[0];
        setMap();
        this.subscribers.forEach((subscriber) => {
          if (subscriber.afterDocAddition) {
            subscriber.afterDocAddition(this.documentMap, updatedDoc);
          }
        });
        this.persistToDb({
          insert: [updatedDoc]
        });
      },
      deleteDoc: (docId: string) => {
        const docToDelete = this.documentMap[docId];
        const docIdsToDelete = this.subscribers.reduce((docIds, subscriber) => {
          if (subscriber.validateDocDeletion) {
            const newIdsToDelete = subscriber.validateDocDeletion(this.documentMap, docToDelete);
            newIdsToDelete.forEach((id) => docIds.add(id));
          }
          return docIds;
        }, new Set<string>());
        const allDocsToDelete: T[] = [];
        docIdsToDelete.forEach((id) => {
          allDocsToDelete.push(this.documentMap[id]);
          this.subscribers.forEach((subscriber) => {
            if (subscriber.beforeDocDeletion) {
              subscriber.beforeDocDeletion(this.documentMap, this.documentMap[id]);
            }
          });
        });
        // Persist the changes to the DB before removing from the map.
        this.persistToDb({
          delete: allDocsToDelete
        });
        docIdsToDelete.forEach((id) => {
          delete this.documentMap[id];
          delete this.childStores[id];
        });
        setMap();
      }
    };
  }
}
