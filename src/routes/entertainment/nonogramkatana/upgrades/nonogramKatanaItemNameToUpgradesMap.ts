import { type NonogramKatanaItemName, NonogramKatanaUpgradeName } from '@aneuhold/core-ts-db-lib';
import { nonogramKatanaUpgradesDisplayInfo } from './nonogramKatanaUpgradesDisplayInfo';

type NonogramKatanaItemNameToUpgradesMap = {
  [key in NonogramKatanaItemName]?: NonogramKatanaUpgradeName[];
};

/**
 * A map from item names to the upgrades that require them.
 *
 * This is a static constant that doesn't involve user data.
 */
const nonogramKatanaItemNameToUpgradesMap: NonogramKatanaItemNameToUpgradesMap = {};
Object.values(NonogramKatanaUpgradeName).forEach((upgradeName) => {
  nonogramKatanaUpgradesDisplayInfo[upgradeName].requiredItems.forEach((requiredItem) => {
    const itemName = requiredItem.itemName;
    const upgradesForItem = nonogramKatanaItemNameToUpgradesMap[itemName] ?? [];
    upgradesForItem.push(upgradeName);
    nonogramKatanaItemNameToUpgradesMap[itemName] = upgradesForItem;
  });
});

export default nonogramKatanaItemNameToUpgradesMap;
