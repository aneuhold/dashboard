import LocalData from '$util/LocalData';
import DashboardAPIService from '$util/api/DashboardAPIService';
import {
  NonogramKatanaItemName,
  NonogramKatanaUpgrade,
  NonogramKatanaUpgradeName
} from '@aneuhold/core-ts-db-lib';
import type { ObjectId } from 'bson';
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
  private static nameToIdMap: { [upgradeName: string]: string } = {};
  /**
   * A map from item names to the upgrades that require them.
   */
  private static itemNameToUpgradesMap: { [itemName: string]: string[] } = {};

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
      this.createHelperMaps(this.getMap());
    }
    return this.getUpgradeStore(this.nameToIdMap[upgradeName]);
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
    const upgradeIds = this.itemNameToUpgradesMap[itemName];
    if (!upgradeIds) {
      return [];
    }
    return upgradeIds
      .filter((upgradeId) => {
        const upgrade = map[upgradeId];
        return !filterToOnlyWorkableUpgrades || workableUpgrades[upgrade.upgradeName];
      })
      .map((upgradeId) => this.getUpgradeStore(upgradeId));
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
      this.createHelperMaps(upgradeMap);
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
          const otherUpgrade = upgradeMap[this.nameToIdMap[requiredUpgrade]];
          return otherUpgrade.completed;
        });
      })
      .reduce(
        (map, [upgradeName, upgradeId]) => {
          map[upgradeName] = upgradeMap[upgradeId];
          return map;
        },
        {} as Record<string, NonogramKatanaUpgrade>
      );
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
        const upgradeDefault = defaultNonogramKatanaUpgrades[upgradeName];
        newUpgrade.completed = upgradeDefault.completed ?? false;
        newUpgrade.priority = upgradeDefault.priority ?? 0;
        newUpgrade.requiredItems = upgradeDefault.requiredItems ?? [];
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
        NonogramKatanaUpgradeMapService.createHelperMaps(map);
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
  private static createHelperMaps(map: Record<string, NonogramKatanaUpgrade>) {
    this.nameToIdMap = {};
    this.itemNameToUpgradesMap = {};
    Object.values(map).forEach((upgrade) => {
      this.nameToIdMap[upgrade.upgradeName] = upgrade._id.toString();
      upgrade.requiredItems.forEach((requiredItem) => {
        if (!this.itemNameToUpgradesMap[requiredItem.itemName]) {
          this.itemNameToUpgradesMap[requiredItem.itemName] = [];
        }
        this.itemNameToUpgradesMap[requiredItem.itemName].push(upgrade._id.toString());
      });
    });
  }
}
