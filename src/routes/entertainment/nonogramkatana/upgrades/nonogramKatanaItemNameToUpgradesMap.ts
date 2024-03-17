import type { NonogramKatanaItemName, NonogramKatanaUpgradeName } from '@aneuhold/core-ts-db-lib';
import { nonogramKatanaUpgradesDisplayInfo } from './nonogramKatanaUpgradesDisplayInfo';

/**
 * A map from item names to the upgrades that require them.
 */
const nonogramKatanaItemNameToUpgradesMap: Record<
  NonogramKatanaItemName,
  NonogramKatanaUpgradeName[]
> = Object.entries(nonogramKatanaUpgradesDisplayInfo).reduce(
  (acc, [upgradeName, upgradeInfo]) => {
    upgradeInfo.requiredItems.forEach((requiredItem) => {
      const itemName = requiredItem.itemName;
      if (!acc[itemName]) {
        acc[itemName] = [];
      }
      acc[itemName].push(upgradeName as NonogramKatanaUpgradeName);
    });
    return acc;
  },
  {} as Record<NonogramKatanaItemName, NonogramKatanaUpgradeName[]>
);

export default nonogramKatanaItemNameToUpgradesMap;
