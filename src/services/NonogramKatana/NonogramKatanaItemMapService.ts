import {
  type DocumentMap,
  type NonogramKatanaItem,
  NonogramKatanaItemName,
  NonogramKatanaItemSchema
} from '@aneuhold/core-ts-db-lib';
import type { UUID } from 'crypto';
import { nonogramKatanaItemsDisplayInfo } from '$routes/entertainment/nonogramkatana/items/nonogramKatanaItemsDisplayInfo';
import DashboardAPIService from '$util/api/DashboardAPIService';
import LocalData from '$util/LocalData/LocalData';
import { createLogger } from '$util/logging/logger';
import type {
  DocumentInsertOrUpdateInfo,
  DocumentMapStore,
  DocumentStore
} from '../DocumentMapStoreService';
import DocumentMapStoreService from '../DocumentMapStoreService';

const log = createLogger('NonogramKatanaItemMapService.ts');

/**
 * The Nonogram Katana item map service.
 */
export class NonogramKatanaItemMapService extends DocumentMapStoreService<NonogramKatanaItem> {
  private static instance = new NonogramKatanaItemMapService();
  private static nameToIdMap: { [itemName: string]: UUID | undefined } = {};

  private constructor() {
    super();
  }

  static getStore(): DocumentMapStore<NonogramKatanaItem> {
    return this.instance.store;
  }

  static getItemStore(itemId: UUID): DocumentStore<NonogramKatanaItem> {
    const itemStore = this.instance.getDocStore(itemId);
    const itemDoc = this.getMap()[itemId];
    if (!itemDoc) {
      log.error(`No item found for ${itemId}. Something went wrong, this shouldn't happen.`);
      return itemStore;
    }
    this.nameToIdMap[itemDoc.itemName] = itemId;
    return itemStore;
  }

  static getItemStoreByName(itemName: NonogramKatanaItemName): DocumentStore<NonogramKatanaItem> {
    if (!this.nameToIdMap[itemName]) {
      this.createItemNameIdMap(this.getMap());
    }
    // It is guaranteed that the item exists at this point.
    return this.getItemStore(this.nameToIdMap[itemName] as UUID);
  }

  static getMap(): DocumentMap<NonogramKatanaItem> {
    return this.instance.documentMap;
  }

  /**
   * Creates or updates the Nonogram Katana items for the given user based
   * on the defaults. It was done this way so that the user didn't need to
   * always have this data created on application load.
   *
   * @param userId The ID of the user to create or update items for.
   */
  static createOrUpdateItems(userId: UUID): void {
    const currentMap = this.getMap();
    const existingItems = Object.values(currentMap).filter((item) => item !== undefined);
    const existingItemNames = new Set(existingItems.map((item) => item.itemName));
    const itemsToAdd: NonogramKatanaItem[] = [];
    const newItemIds: Set<UUID> = new Set();
    Object.values(NonogramKatanaItemName).forEach((itemName) => {
      if (!existingItemNames.has(itemName)) {
        const itemDisplayInfo = nonogramKatanaItemsDisplayInfo[itemName];
        const newItem = NonogramKatanaItemSchema.parse({
          userId,
          itemName,
          currentAmount: 0,
          priority: itemDisplayInfo.defaultPriority ?? -50
        });
        newItemIds.add(newItem._id);
        itemsToAdd.push(newItem);
      }
    });
    if (itemsToAdd.length > 0) {
      this.getStore().upsertMany({
        filter: (doc) => newItemIds.has(doc._id),
        newDocs: itemsToAdd,
        updater: (doc) => doc
      });
    }
  }

  protected setupSubscribers(): void {
    this.subscribers.push({
      afterMapSet: (map) => {
        NonogramKatanaItemMapService.createItemNameIdMap(map);
      }
    });
  }

  protected persistToLocalData(): DocumentMap<NonogramKatanaItem> {
    return LocalData.setAndGetNonogramKatanaItemMap(this.documentMap);
  }
  protected getFromLocalData(): DocumentMap<NonogramKatanaItem> | null {
    return LocalData.nonogramKatanaItemMap;
  }
  protected persistToDb(updateInfo: DocumentInsertOrUpdateInfo<NonogramKatanaItem>): void {
    DashboardAPIService.queryApi({
      update: updateInfo.update ? { nonogramKatanaItems: updateInfo.update } : undefined,
      insert: updateInfo.insert ? { nonogramKatanaItems: updateInfo.insert } : undefined,
      get: {
        nonogramKatanaItems: true
      }
    });
  }

  private static createItemNameIdMap(map: DocumentMap<NonogramKatanaItem>) {
    this.nameToIdMap = {};
    Object.values(map).forEach((item) => {
      if (!item) {
        return;
      }
      this.nameToIdMap[item.itemName] = item._id;
    });
  }
}
