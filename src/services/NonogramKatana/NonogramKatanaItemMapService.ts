import LocalData from '$util/LocalData';
import DashboardAPIService from '$util/api/DashboardAPIService';
import { NonogramKatanaItem, NonogramKatanaItemName } from '@aneuhold/core-ts-db-lib';
import type { ObjectId } from 'bson';
import type {
  DocumentInsertOrUpdateInfo,
  DocumentMapStore,
  DocumentStore
} from '../DocumentMapStoreService';
import DocumentMapStoreService from '../DocumentMapStoreService';

const nonogramKatanaDefaultItems: {
  [key in NonogramKatanaItemName]: Partial<NonogramKatanaItem>;
} = {
  [NonogramKatanaItemName.Coin]: {
    currentAmount: 163,
    storageCap: 1360,
    priority: 1
  },
  [NonogramKatanaItemName.CryptoCoin]: {
    currentAmount: 328,
    storageCap: 1360
  },
  [NonogramKatanaItemName.Ruby]: {
    currentAmount: 35,
    storageCap: 1360
  },
  [NonogramKatanaItemName.Fan]: {
    itemName: NonogramKatanaItemName.Fan,
    currentAmount: 62,
    storageCap: 136
  },
  [NonogramKatanaItemName.Arrows]: {
    itemName: NonogramKatanaItemName.Arrows,
    currentAmount: 0,
    storageCap: 136
  },
  [NonogramKatanaItemName.Katana]: {
    itemName: NonogramKatanaItemName.Katana,
    currentAmount: 0,
    storageCap: 136
  },
  [NonogramKatanaItemName.Shuriken]: {
    itemName: NonogramKatanaItemName.Shuriken,
    currentAmount: 0,
    storageCap: 136
  },
  [NonogramKatanaItemName.Spikes]: {
    itemName: NonogramKatanaItemName.Spikes,
    currentAmount: 0,
    storageCap: 136
  },
  [NonogramKatanaItemName.Boomerang]: {
    itemName: NonogramKatanaItemName.Boomerang,
    currentAmount: 0,
    storageCap: 136
  },
  [NonogramKatanaItemName.Petard]: {
    itemName: NonogramKatanaItemName.Petard,
    currentAmount: 0,
    storageCap: 136
  },
  [NonogramKatanaItemName.Bomb]: {
    itemName: NonogramKatanaItemName.Bomb,
    currentAmount: 0,
    storageCap: 136
  },
  [NonogramKatanaItemName.Firework]: {
    itemName: NonogramKatanaItemName.Firework,
    currentAmount: 0,
    storageCap: 136
  },
  [NonogramKatanaItemName.BatteringRam]: {
    itemName: NonogramKatanaItemName.BatteringRam,
    currentAmount: 0,
    storageCap: 136
  },
  [NonogramKatanaItemName.Anchor]: {
    itemName: NonogramKatanaItemName.Anchor,
    currentAmount: 0,
    storageCap: 136
  },
  [NonogramKatanaItemName.Wood]: {
    itemName: NonogramKatanaItemName.Wood,
    currentAmount: 0,
    storageCap: 272,
    minDesired: 50,
    maxDesired: 200
  },
  [NonogramKatanaItemName.WoodenBeam]: {
    itemName: NonogramKatanaItemName.WoodenBeam,
    currentAmount: 0,
    storageCap: 272,
    maxDesired: 200
  },
  [NonogramKatanaItemName.WoodenPlank]: {
    itemName: NonogramKatanaItemName.WoodenPlank,
    currentAmount: 0,
    storageCap: 272,
    maxDesired: 200
  },
  [NonogramKatanaItemName.Stone]: {
    itemName: NonogramKatanaItemName.Stone,
    currentAmount: 0,
    storageCap: 100,
    minDesired: 50,
    maxDesired: 100
  },
  [NonogramKatanaItemName.Steel]: {
    itemName: NonogramKatanaItemName.Steel,
    currentAmount: 0,
    storageCap: 100,
    minDesired: 50,
    maxDesired: 100
  },
  [NonogramKatanaItemName.MeteoricIron]: {
    itemName: NonogramKatanaItemName.MeteoricIron,
    currentAmount: 0,
    storageCap: 100
  },
  [NonogramKatanaItemName.Charcoal]: {
    itemName: NonogramKatanaItemName.Charcoal,
    currentAmount: 0,
    storageCap: 100
  },
  [NonogramKatanaItemName.Gunpowder]: {
    itemName: NonogramKatanaItemName.Gunpowder,
    currentAmount: 0,
    storageCap: 100
  },
  [NonogramKatanaItemName.IronSand]: {
    itemName: NonogramKatanaItemName.IronSand,
    currentAmount: 0,
    storageCap: 100
  },
  [NonogramKatanaItemName.Chemicals]: {
    itemName: NonogramKatanaItemName.Chemicals,
    currentAmount: 0,
    storageCap: 100
  },
  [NonogramKatanaItemName.Thread]: {
    itemName: NonogramKatanaItemName.Thread,
    currentAmount: 0,
    storageCap: 100
  },
  [NonogramKatanaItemName.Pearl]: {
    itemName: NonogramKatanaItemName.Pearl,
    currentAmount: 0,
    storageCap: 100
  },
  [NonogramKatanaItemName.Rice]: {
    itemName: NonogramKatanaItemName.Rice,
    currentAmount: 0,
    storageCap: 100
  },
  [NonogramKatanaItemName.Wheat]: {
    itemName: NonogramKatanaItemName.Wheat,
    currentAmount: 0,
    storageCap: 100
  },
  [NonogramKatanaItemName.Flour]: {
    itemName: NonogramKatanaItemName.Flour,
    currentAmount: 0,
    storageCap: 100
  },
  [NonogramKatanaItemName.Egg]: {
    itemName: NonogramKatanaItemName.Egg,
    currentAmount: 0,
    storageCap: 100
  },
  [NonogramKatanaItemName.CoffeeBeans]: {
    itemName: NonogramKatanaItemName.CoffeeBeans,
    currentAmount: 0,
    storageCap: 100
  },
  [NonogramKatanaItemName.Spices]: {
    itemName: NonogramKatanaItemName.Spices,
    currentAmount: 0,
    storageCap: 100
  },
  [NonogramKatanaItemName.Salmon]: {
    itemName: NonogramKatanaItemName.Salmon,
    currentAmount: 0,
    storageCap: 100
  },
  [NonogramKatanaItemName.Sushi]: {
    itemName: NonogramKatanaItemName.Sushi,
    currentAmount: 0,
    storageCap: 100
  },
  [NonogramKatanaItemName.FriedEggs]: {
    itemName: NonogramKatanaItemName.FriedEggs,
    currentAmount: 0,
    storageCap: 100
  }
};

/**
 * The Nonogram Katana item map service.
 *
 * What are the options for querying or using this?
 *
 * - There's a default list of items currently. Should that even exist?
 * - The idea is if the user has edited an item, then it gets inserted into
 * the DB. If the user has not edited an item, then it doesn't get inserted.
 * - There also needs to be a way to edit required items to create something
 * globally. But that could be listed in the display info perhaps.
 * - Does it need to immediately be hooked up to the DB in order to work? It
 * actually probably does, because the local data would be incorrect otherwise.
 * - So this means that all the values do need to be initialized to the DB. But
 * when?
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
      console.error('There was an error when trying to get the item with itemName: ' + itemName);
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
        const defaultItem = nonogramKatanaDefaultItems[itemName];
        newItem.currentAmount = defaultItem.currentAmount ?? 0;
        newItem.storageCap = defaultItem.storageCap ?? 400;
        newItem.minDesired = defaultItem.minDesired ?? 0;
        newItem.maxDesired = defaultItem.maxDesired ?? newItem.storageCap * 0.9;
        newItem.priority = defaultItem.priority ?? 0;
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
        NonogramKatanaItemMapService.nameToIdMap = {};
        Object.values(map).forEach((item) => {
          NonogramKatanaItemMapService.nameToIdMap[item.itemName] = item._id.toString();
        });
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
      insert: updateInfo.insert ? { nonogramKatanaItems: updateInfo.insert } : undefined
    });
  }
}
