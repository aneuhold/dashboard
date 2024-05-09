import LocalData from '$util/LocalData';
import DashboardAPIService from '$util/api/DashboardAPIService';
import {
  NonogramKatanaItemName,
  NonogramKatanaUpgrade,
  NonogramKatanaUpgradeName
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
 * The Nonogram Katana upgrade map service.
 */
export class NonogramKatanaUpgradeMapService extends DocumentMapStoreService<NonogramKatanaUpgrade> {
  private static instance = new NonogramKatanaUpgradeMapService();
  private static nameToIdMap: { [key in NonogramKatanaUpgradeName]?: string } = {};

  private constructor() {
    super();
  }

  static getStore(): DocumentMapStore<NonogramKatanaUpgrade> {
    return this.instance.store;
  }

  static getUpgradeStore(upgradeId: string): DocumentStore<NonogramKatanaUpgrade> {
    const upgradeStore = this.instance.getDocStore(upgradeId);
    this.nameToIdMap[this.getMap()[upgradeId].upgradeName] = upgradeId;
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
   * Gets the list of upgrade stores that require the given item name.
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
        const upgradeAId = this.nameToIdMap[a]!;
        const upgradeBId = this.nameToIdMap[b]!;
        const aPriority = map[upgradeAId].priority;
        const bPriority = map[upgradeBId].priority;
        return bPriority - aPriority;
      });
    const upgradeStores = filteredUpgradeNames.map((upgradeName) =>
      this.getUpgradeStoreByName(upgradeName)
    );
    return upgradeStores;
  }

  static getMap(): Record<string, NonogramKatanaUpgrade> {
    return this.instance.documentMap;
  }

  /**
   * Gets the workable upgrades for the provided map of ids to upgrades. The
   * returned map is based on the upgrade name instead of the ID.
   */
  static getWorkableUpgrades(
    upgradeMap: Record<string, NonogramKatanaUpgrade>
  ): Record<string, NonogramKatanaUpgrade> {
    if (Object.values(this.nameToIdMap).length === 0) {
      this.createNameToIdMap(upgradeMap);
    }
    const workableUpgrades = Object.entries(this.nameToIdMap)
      .filter(([upgradeName, upgradeId]) => {
        const upgrade = upgradeMap[upgradeId];
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
          return otherUpgrade.completed;
        });
      })
      .reduce<Record<string, NonogramKatanaUpgrade>>((map, [upgradeName, upgradeId]) => {
        map[upgradeName] = upgradeMap[upgradeId];
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
    const existingUpgradeNames = new Set(
      Object.values(currentMap).map((upgrade) => upgrade.upgradeName)
    );
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

  protected persistToLocalData(): Record<string, NonogramKatanaUpgrade> {
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
  private static createNameToIdMap(map: Record<string, NonogramKatanaUpgrade>) {
    this.nameToIdMap = {};
    Object.values(map).forEach((upgrade) => {
      this.nameToIdMap[upgrade.upgradeName] = upgrade._id.toString();
    });
  }
}
