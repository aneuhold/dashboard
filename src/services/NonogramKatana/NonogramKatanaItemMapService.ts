import LocalData from '$util/LocalData';
import DashboardAPIService from '$util/api/DashboardAPIService';
import { NonogramKatanaItem, NonogramKatanaItemName } from '@aneuhold/core-ts-db-lib';
import type { ObjectId } from 'bson';
import { nonogramKatanaItemsDisplayInfo } from '../../routes/entertainment/nonogramkatana/items/nonogramKatanaItemsDisplayInfo';
import type {
  DocumentInsertOrUpdateInfo,
  DocumentMapStore,
  DocumentStore
} from '../DocumentMapStoreService';
import DocumentMapStoreService from '../DocumentMapStoreService';

/**
 * The Nonogram Katana item map service.
 */
export class NonogramKatanaItemMapService extends DocumentMapStoreService<NonogramKatanaItem> {
  private static instance = new NonogramKatanaItemMapService();
  private static nameToIdMap: { [itemName: string]: string } = {};

  private constructor() {
    super();
  }

  static getStore(): DocumentMapStore<NonogramKatanaItem> {
    return this.instance.store;
  }

  static getItemStore(itemId: string): DocumentStore<NonogramKatanaItem> {
    const itemStore = this.instance.getDocStore(itemId);
    this.nameToIdMap[this.getMap()[itemId].itemName] = itemId;
    return itemStore;
  }

  static getItemStoreByName(itemName: NonogramKatanaItemName): DocumentStore<NonogramKatanaItem> {
    if (!this.nameToIdMap[itemName]) {
      this.createItemNameIdMap(this.getMap());
    }
    return this.getItemStore(this.nameToIdMap[itemName]);
  }

  static getMap(): Record<string, NonogramKatanaItem> {
    return this.instance.documentMap;
  }

  /**
   * Creates or updates the Nonogram Katana items for the given user based
   * on the defaults. It was done this way so that the user didn't need to
   * always have this data created on application load.
   */
  static createOrUpdateItems(userId: ObjectId): void {
    const currentMap = this.getMap();
    const existingItemNames = new Set(Object.values(currentMap).map((item) => item.itemName));
    const itemsToAdd: NonogramKatanaItem[] = [];
    const newItemIds: Set<string> = new Set();
    Object.values(NonogramKatanaItemName).forEach((itemName) => {
      if (!existingItemNames.has(itemName)) {
        const newItem = new NonogramKatanaItem(userId, itemName);
        const itemDisplayInfo = nonogramKatanaItemsDisplayInfo[itemName];
        newItem.currentAmount = 0;
        newItem.priority = itemDisplayInfo.defaultPriority ?? -50;
        newItemIds.add(newItem._id.toString());
        itemsToAdd.push(newItem);
      }
    });
    if (itemsToAdd.length > 0) {
      this.getStore().upsertMany({
        filter: (doc) => newItemIds.has(doc._id.toString()),
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

  protected persistToLocalData(): Record<string, NonogramKatanaItem> {
    return LocalData.setAndGetNonogramKatanaItemMap(this.documentMap);
  }
  protected getFromLocalData(): Record<string, NonogramKatanaItem> | null {
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

  private static createItemNameIdMap(map: Record<string, NonogramKatanaItem>) {
    this.nameToIdMap = {};
    Object.values(map).forEach((item) => {
      this.nameToIdMap[item.itemName] = item._id.toString();
    });
  }
}
