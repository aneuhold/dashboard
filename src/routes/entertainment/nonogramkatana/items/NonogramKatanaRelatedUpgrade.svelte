<!--
  @component
  
  A component that provides details about a related upgrade to a particular
  item.
-->
<script lang="ts">
  import { NonogramKatanaItemName, NonogramKatanaUpgrade } from '@aneuhold/core-ts-db-lib';
  import type { DocumentStore } from '../../../../services/DocumentMapStoreService';
  import { nonogramKatanaUpgradesDisplayInfo } from '../upgrades/nonogramKatanaUpgradesDisplayInfo';

  let {
    itemName,
    relatedUpgrade
  }: {
    itemName: NonogramKatanaItemName;
    relatedUpgrade: DocumentStore<NonogramKatanaUpgrade>;
  } = $props();

  let upgradeDisplayInfo = $derived(nonogramKatanaUpgradesDisplayInfo[$relatedUpgrade.upgradeName]);
  let requiredItemAmount = $derived(
    upgradeDisplayInfo.requiredItems.find((requiredItem) => requiredItem.itemName === itemName)
      ?.requiredAmount
  );
</script>

{#if requiredItemAmount}
  <li>
    {upgradeDisplayInfo.displayName} (total needed: {requiredItemAmount}, amount spent: {$relatedUpgrade
      .currentItemAmounts[itemName] ?? 0}
    {requiredItemAmount === ($relatedUpgrade.currentItemAmounts[itemName] ?? 0) ? '✅' : ''})
  </li>
{/if}
