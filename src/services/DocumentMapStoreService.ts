import { localDataReady } from '$util/LocalData/LocalData';
import type { BaseDocument, DocumentMap } from '@aneuhold/core-ts-db-lib';
import { writable, type Readable, type Updater, type Writable } from 'svelte/store';

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
  deleteMany: (docIds: string[]) => void;
}

export interface SetableStore<T> extends Readable<T> {
  set: (value: T) => void;
}

/**
 * A store that contains a map of documents with the document ID as the key.
 */
export type DocumentMapStore<T extends BaseDocument> = PersistentParentStore<T> &
  SetableStore<DocumentMap<T>>;
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
  beforeMapSet?: (oldMap: DocumentMap<T>, newMap: DocumentMap<T>) => void;
  afterMapSet?: (newMap: DocumentMap<T>) => void;
  /**
   * A hook which runs before a document is added to the map. This can be used
   * to modify the document before it is added to the map.
   */
  beforeDocAddition?: (map: DocumentMap<T>, newDoc: T) => T;
  afterDocAddition?: (map: DocumentMap<T>, newDoc: T) => void;
  /**
   * A hook which runs once before a doc is deleted from the map. This can be
   * used to validate that the doc can be deleted or indicate that other docs
   * should be deleted as well.
   *
   * This runs before the `beforeDocDeletion` hook.
   */
  validateDocDeletion?: (map: DocumentMap<T>, docToDelete: T) => string[];
  beforeDocDeletion?: (map: DocumentMap<T>, docToDelete: T) => void;
  afterDocDeletion?: (map: DocumentMap<T>, docsDeleted: T[]) => void;
  /**
   * A hook which runs before a doc is updated in the map. This can be used to
   * indicate that the update to the doc will require other docs to be updated
   * as well, and what should happen to those docs.
   *
   * This runs before the `beforeDocUpdate` hook.
   */
  validateDocUpdate?: (
    map: DocumentMap<T>,
    oldDoc: T | undefined,
    newDoc: T
  ) => UpsertManyInfo<T> | null;
  /**
   * A hook which runs before any doc is updated. The doc can be modified.
   */
  beforeDocUpdate?: (map: DocumentMap<T>, oldDoc: T | undefined, newDoc: T) => T;
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
  protected documentMap: DocumentMap<T> = {};
  protected store: DocumentMapStore<T> = this.createMapStore();
  protected childStores: Record<string, DocumentChildStore<T> | undefined> = {};
  protected previousState: DocumentMap<T> = {};
  /**
   * This should be refactored to be more specific once things are in a working
   * state. That way the forEach loop can be removed.
   */
  protected subscribers: DocumentMapStoreSubscriber<T>[] = [];

  protected constructor() {
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
  protected abstract persistToLocalData(): DocumentMap<T>;

  /**
   * Gets the map from local storage.
   */
  protected abstract getFromLocalData(): DocumentMap<T> | null;

  protected abstract persistToDb(updateInfo: DocumentInsertOrUpdateInfo<T>): void;

  /**
   * Gets the store for the specified document ID. If the store does not exist,
   * it will be created.
   *
   * @param docId
   */
  protected getDocStore(docId: string): DocumentChildStore<T> {
    let childStore = this.childStores[docId];
    if (!childStore) {
      childStore = this.createDocStore(docId);
      this.childStores[docId] = childStore;
    }
    return childStore;
  }

  private createDocStore(docId: string): DocumentChildStore<T> {
    const document = this.documentMap[docId];
    if (!document) {
      throw new Error(`Cannot create doc store for doc that does not exist. Doc ID: ${docId}`);
    }
    const { subscribe, set } = writable<T>(document);

    const updateDoc = (updater: Updater<T>): void => {
      let newDoc = updater(document);
      // Check if this update needs to update other docs as well
      const updateManyArray = this.subscribers.reduce<
        {
          filter: (currentDoc: T) => boolean;
          updater: Updater<T>;
        }[]
      >((updateManyArray, subscriber) => {
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
      }, []);
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
    const { subscribe, set } = writable<DocumentMap<T>>(this.documentMap);

    localDataReady.subscribe((ready) => {
      const localDataMap = this.getFromLocalData();
      if (ready && localDataMap) {
        this.documentMap = localDataMap;
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
    ): T[] => {
      const docsToUpdate = Object.values(this.documentMap).filter(
        (doc) => doc && filter(doc)
      ) as T[];
      return docsToUpdate.map((doc) => {
        const docId = doc._id.toString();
        const updatedDoc = updater(doc);
        this.documentMap[docId] = updatedDoc;
        // Run subscribers
        this.subscribers.forEach((subscriber) => {
          if (subscriber.beforeDocUpdate) {
            subscriber.beforeDocUpdate(this.documentMap, this.previousState[docId], updatedDoc);
          }
        });
        const childStore = this.childStores[docId];
        if (childStore) {
          // Set the child store without propogating the change to the parent
          childStore.setWithoutPropogation(updatedDoc);
        }
        // Return the updated doc, which is in the same memory location as the
        // original doc in the map
        return updatedDoc;
      });
    };

    const addManyWithoutPersist = (docsToAdd: T[]): T[] => {
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

    const deleteManyDocs = (docIds: string[]): void => {
      const docsToDelete: T[] = [];
      docIds.forEach((id) => {
        const doc = this.documentMap[id];
        if (!doc) {
          console.error(`Document with ID ${id} does not exist in the map.`);
          return;
        }
        docsToDelete.push(doc);
      });
      // Validate deletion to find more to delete
      const docIdsToDelete = this.subscribers.reduce((newDocIdsToDelete, subscriber) => {
        if (subscriber.validateDocDeletion) {
          const validateFunction = subscriber.validateDocDeletion;
          docsToDelete.forEach((docToDelete) => {
            const newIdsToDelete = validateFunction(this.documentMap, docToDelete);
            newIdsToDelete.forEach((id) => newDocIdsToDelete.add(id));
          });
        }
        return newDocIdsToDelete;
      }, new Set<string>());
      // Run before deletion hooks
      const allDocsToDelete: T[] = [];
      docIdsToDelete.forEach((id) => {
        const doc = this.documentMap[id];
        if (!doc) {
          console.error(`Document with ID ${id} does not exist in the map.`);
          return;
        }
        allDocsToDelete.push(doc);
        this.subscribers.forEach((subscriber) => {
          if (subscriber.beforeDocDeletion) {
            subscriber.beforeDocDeletion(this.documentMap, doc);
          }
        });
      });
      docIdsToDelete.forEach((id) => {
        delete this.documentMap[id];
        delete this.childStores[id];
      });
      setMap();
      // Run after deletion hooks
      this.subscribers.forEach((subscriber) => {
        if (subscriber.afterDocDeletion) {
          subscriber.afterDocDeletion(this.documentMap, docsToDelete);
        }
      });
      // Persist
      this.persistToDb({
        delete: docsToDelete
      });
    };

    return {
      subscribe,
      /**
       * Sets the document map. This should only be used when the store is
       * initialized from data that comes from the backend.
       *
       * @param newMap
       */
      set: (newMap) => {
        this.documentMap = newMap;
        Object.entries(this.childStores).forEach(([docId, store]) => {
          const doc = this.documentMap[docId];
          if (!doc) {
            delete this.childStores[docId];
          } else if (store) {
            store.setWithoutPropogation(doc);
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
        const doc = this.documentMap[childId];
        if (!doc) {
          console.error(`Document with ID ${childId} does not exist in the map.`);
        } else {
          this.persistToDb({
            update: [doc]
          });
        }
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
      deleteMany: (docIds: string[]) => {
        deleteManyDocs(docIds);
      },
      deleteDoc: (docId: string) => {
        deleteManyDocs([docId]);
      }
    };
  }
}
