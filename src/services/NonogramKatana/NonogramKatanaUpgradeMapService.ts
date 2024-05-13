import LocalData from '$util/LocalData';
import DashboardAPIService from '$util/api/DashboardAPIService';
import {
  NonogramKatanaItemName,
  NonogramKatanaUpgrade,
  NonogramKatanaUpgradeName,
  type DocumentMap
} from '@aneuhold/core-ts-db-lib';
import type { ObjectId } from 'bson';
import nonogramKatanaItemNameToUpgradesMap from '../../routes/entertainment/nonogramkatana/upgrades/nonogramKatanaItemNameToUpgradesMap';
import { nonogramKatanaUpgradesDisplayInfo } from '../../routes/entertainment/nonogramkatana/upgrades/nonogramKatanaUpgradesDisplayInfo';
import type {
  DocumentInsertOrUpdateInfo,
  DocumentMapStore,
  DocumentStore
} from '../DocumentMapStoreService';
import DocumentMapStoreService from '../DocumentMapStoreService';

/**
 * The Nonogram Katana upgrade map service. This is the document service for
 * {@link NonogramKatanaUpgrade} documents.
 */
export class NonogramKatanaUpgradeMapService extends DocumentMapStoreService<NonogramKatanaUpgrade> {
  private static instance = new NonogramKatanaUpgradeMapService();
  /**
   * The map of upgrade names to their associated document ID. This doesn't
   * always have a value, because upgrades might not be in the DB yet for the
   * current user.
   */
  private static nameToIdMap: { [key in NonogramKatanaUpgradeName]?: string } = {};

  private constructor() {
    super();
  }

  static getStore(): DocumentMapStore<NonogramKatanaUpgrade> {
    return this.instance.store;
  }

  /**
   * Gets the {@link NonogramKatanaUpgrade} store with the provided `upgradeId`.
   */
  static getUpgradeStore(upgradeId: string): DocumentStore<NonogramKatanaUpgrade> {
    const upgradeStore = this.instance.getDocStore(upgradeId);
    const upgradeDoc = this.getMap()[upgradeId];
    if (!upgradeDoc) {
      console.error(
        `No upgrade found for ${upgradeId}. Something went wrong, this shouldn't happen.`
      );
      return upgradeStore;
    }
    this.nameToIdMap[upgradeDoc.upgradeName] = upgradeId;
    return upgradeStore;
  }

  static getUpgradeStoreByName(
    upgradeName: NonogramKatanaUpgradeName
  ): DocumentStore<NonogramKatanaUpgrade> {
    if (!this.nameToIdMap[upgradeName]) {
      this.createNameToIdMap(this.getMap());
    }
    return this.getUpgradeStore(this.nameToIdMap[upgradeName] as string);
  }

  /**
   * Gets the array of {@link NonogramKatanaUpgrade} stores that require
   * the given item name.
   */
  static getUpgradeStoresByItemName(
    itemName: NonogramKatanaItemName,
    filterToOnlyWorkableUpgrades = true
  ): DocumentStore<NonogramKatanaUpgrade>[] {
    const map = this.getMap();
    const workableUpgrades = this.getWorkableUpgrades(map);
    const upgradeNames = nonogramKatanaItemNameToUpgradesMap[itemName];
    if (!upgradeNames) {
      return [];
    }
    const filteredUpgradeNames = upgradeNames
      .filter((upgradeName) => {
        return !filterToOnlyWorkableUpgrades || workableUpgrades[upgradeName];
      })
      .sort((a, b) => {
        const upgradeAId = this.nameToIdMap[a];
        const upgradeBId = this.nameToIdMap[b];
        if (!upgradeAId) {
          return 1;
        } else if (!upgradeBId) {
          return -1;
        }
        const aPriority = map[upgradeAId]?.priority ?? 0;
        const bPriority = map[upgradeBId]?.priority ?? 0;
        return bPriority - aPriority;
      });
    const upgradeStores = filteredUpgradeNames.map((upgradeName) =>
      this.getUpgradeStoreByName(upgradeName)
    );
    return upgradeStores;
  }

  /**
   * Gets the current map of {@link NonogramKatanaUpgrade} documents.
   */
  static getMap(): DocumentMap<NonogramKatanaUpgrade> {
    return this.instance.documentMap;
  }

  /**
   * Gets the workable upgrades for the provided map of ids to upgrades. The
   * returned map is based on the upgrade name instead of the ID.
   *
   * Workable upgrades are upgrades that are not completed and have all their
   * required upgrades completed.
   */
  static getWorkableUpgrades(upgradeMap: DocumentMap<NonogramKatanaUpgrade>): {
    [key in NonogramKatanaUpgradeName]?: NonogramKatanaUpgrade;
  } {
    // Create the name to ID map if it doesn't exist yet
    if (Object.values(this.nameToIdMap).length === 0) {
      this.createNameToIdMap(upgradeMap);
    }
    const workableUpgrades = Object.entries(this.nameToIdMap)
      .filter(([upgradeName, upgradeId]) => {
        const upgrade = upgradeMap[upgradeId];
        if (!upgrade) {
          return false;
        }
        if (upgrade.completed) {
          return false;
        }
        const upgradeDisplayInfo =
          nonogramKatanaUpgradesDisplayInfo[upgradeName as NonogramKatanaUpgradeName];
        return upgradeDisplayInfo.requiredUpgrades.every((requiredUpgrade) => {
          const otherUpgradeId = this.nameToIdMap[requiredUpgrade];
          if (!otherUpgradeId) {
            console.error('No upgrade ID found for', requiredUpgrade);
            return false;
          }
          const otherUpgrade = upgradeMap[otherUpgradeId];
          if (!otherUpgrade) {
            console.error('No upgrade found for', otherUpgradeId);
            return false;
          }
          return otherUpgrade.completed;
        });
      })
      .reduce<Record<string, NonogramKatanaUpgrade>>((map, [upgradeName, upgradeId]) => {
        const upgrade = upgradeMap[upgradeId];
        if (!upgrade) {
          return map;
        }
        map[upgradeName] = upgrade;
        return map;
      }, {});
    return workableUpgrades;
  }

  /**
   * Currently just creates new upgrades that don't already exist. Should
   * probably be enhanced so that it can update existing ones in the DB.
   */
  static createOrUpdateUpgrades(userId: ObjectId): void {
    const currentMap = this.getMap();
    const existingUpgrades = Object.values(currentMap).filter(
      (upgrade) => upgrade !== undefined
    ) as NonogramKatanaUpgrade[];
    const existingUpgradeNames = new Set(existingUpgrades.map((upgrade) => upgrade.upgradeName));
    const upgradesToAdd: NonogramKatanaUpgrade[] = [];
    const newUpgradeIds: Set<string> = new Set();
    Object.values(NonogramKatanaUpgradeName).forEach((upgradeName) => {
      if (!existingUpgradeNames.has(upgradeName)) {
        const newUpgrade = new NonogramKatanaUpgrade(userId, upgradeName);
        const upgradeDisplayInfo = nonogramKatanaUpgradesDisplayInfo[upgradeName];
        newUpgrade.completed = false;
        // -50 so that it goes after all the ones with a default priority
        newUpgrade.priority = upgradeDisplayInfo.defaultPriority ?? -50;
        newUpgrade.currentItemAmounts = {};
        upgradeDisplayInfo.requiredItems.forEach((requiredItem) => {
          newUpgrade.currentItemAmounts[requiredItem.itemName] = 0;
        });
        newUpgradeIds.add(newUpgrade._id.toString());
        upgradesToAdd.push(newUpgrade);
      }
    });
    if (upgradesToAdd.length > 0) {
      this.getStore().upsertMany({
        filter: (doc) => newUpgradeIds.has(doc._id.toString()),
        newDocs: upgradesToAdd,
        updater: (doc) => doc
      });
    }
  }

  protected setupSubscribers(): void {
    this.subscribers.push({
      afterMapSet: (map) => {
        NonogramKatanaUpgradeMapService.createNameToIdMap(map);
      }
    });
  }

  protected persistToLocalData(): DocumentMap<NonogramKatanaUpgrade> {
    return LocalData.setAndGetNonogramKatanaUpgradeMap(this.documentMap);
  }
  protected getFromLocalData(): Record<string, NonogramKatanaUpgrade> | null {
    return LocalData.nonogramKatanaUpgradeMap;
  }
  protected persistToDb(updateInfo: DocumentInsertOrUpdateInfo<NonogramKatanaUpgrade>): void {
    DashboardAPIService.queryApi({
      update: updateInfo.update ? { nonogramKatanaUpgrades: updateInfo.update } : undefined,
      insert: updateInfo.insert ? { nonogramKatanaUpgrades: updateInfo.insert } : undefined,
      get: {
        nonogramKatanaUpgrades: true
      }
    });
  }

  /**
   * Creates a couple helper maps for easier access to the upgrades.
   */
  private static createNameToIdMap(map: DocumentMap<NonogramKatanaUpgrade>) {
    this.nameToIdMap = {};
    Object.values(map).forEach((upgrade) => {
      if (!upgrade) {
        return;
      }
      this.nameToIdMap[upgrade.upgradeName] = upgrade._id.toString();
    });
  }
}
