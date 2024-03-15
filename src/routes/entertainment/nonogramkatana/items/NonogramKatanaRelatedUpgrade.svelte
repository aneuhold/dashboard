<!--
  @component
  
  A component that provides details about a related upgrade to a particular
  item.
-->
<script lang="ts">
  import { NonogramKatanaItemName, NonogramKatanaUpgrade } from '@aneuhold/core-ts-db-lib';
  import type { DocumentStore } from '../../../../services/DocumentMapStoreService';
  import { NonogramKatanaItemMapService } from '../../../../services/NonogramKatana/NonogramKatanaItemMapService';
  import { nonogramKatanaUpgradesDisplayInfo } from '../upgrades/+page.svelte';

  export let itemName: NonogramKatanaItemName;
  export let relatedUpgrade: DocumentStore<NonogramKatanaUpgrade>;

  $: item = NonogramKatanaItemMapService.getItemStoreByName(itemName);
  $: upgradeDisplayInfo = nonogramKatanaUpgradesDisplayInfo[$relatedUpgrade.upgradeName];
  $: requiredItemAmounts = $relatedUpgrade.requiredItems.find(
    (requiredItem) => requiredItem.itemName === itemName
  );
</script>

{#if requiredItemAmounts}
  <li>
    {upgradeDisplayInfo.displayName} (total needed: {requiredItemAmounts.requiredAmount})
  </li>
{/if}
