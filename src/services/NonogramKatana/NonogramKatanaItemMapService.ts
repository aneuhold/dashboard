import {
  type DocumentMap,
  type NonogramKatanaItem,
  NonogramKatanaItemName,
  NonogramKatanaItemSchema
} from '@aneuhold/core-ts-db-lib';
import type { UUID } from 'crypto';
import { nonogramKatanaItemsDisplayInfo } from '$routes/entertainment/nonogramkatana/items/nonogramKatanaItemsDisplayInfo';
import createDashboardPersistToDb, {
  createDashboardPrepareForSave
} from '$util/api/dashboardPersistenceUtils';
import LocalData from '$util/LocalData/LocalData';
import DocumentMapStoreService from '../DocumentMapStoreService.svelte';

/**
 * The Nonogram Katana item map service.
 */
export class NonogramKatanaItemMapService extends DocumentMapStoreService<NonogramKatanaItem> {
  private nameToIdMap: { [itemName: string]: UUID | undefined } = {};

  constructor() {
    super({
      persistToLocalData: (map) => LocalData.setAndGetNonogramKatanaItemMap(map),
      persistToDb: createDashboardPersistToDb('nonogramKatanaItems'),
      prepareForSave: createDashboardPrepareForSave('nonogramKatanaItems')
    });
  }

  public getItemByName(itemName: NonogramKatanaItemName): NonogramKatanaItem | undefined {
    if (!this.nameToIdMap[itemName]) {
      this.createItemNameIdMap(this.mapState);
    }
    const id = this.nameToIdMap[itemName];
    if (!id) return undefined;
    return this.mapState[id];
  }

  /**
   * Creates or updates the Nonogram Katana items for the given user based
   * on the defaults. It was done this way so that the user didn't need to
   * always have this data created on application load.
   *
   * @param userId The ID of the user to create or update items for.
   */
  public createOrUpdateItems(userId: UUID): void {
    const currentMap = this.mapState;
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
      this.upsertManyDocs({
        filter: (doc) => newItemIds.has(doc._id),
        newDocs: itemsToAdd,
        mutator: (doc) => doc
      });
    }
  }

  public override setMap(newMap: DocumentMap<NonogramKatanaItem>): void {
    super.setMap(newMap);
    this.createItemNameIdMap(newMap);
  }

  private createItemNameIdMap(map: DocumentMap<NonogramKatanaItem>): void {
    this.nameToIdMap = {};
    Object.values(map).forEach((item) => {
      if (item) {
        this.nameToIdMap[item.itemName] = item._id;
      }
    });
  }
}

const nonogramKatanaItemMapService = new NonogramKatanaItemMapService();

export default nonogramKatanaItemMapService;
