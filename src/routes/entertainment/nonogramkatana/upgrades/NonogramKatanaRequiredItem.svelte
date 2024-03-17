<script lang="ts">
  import { NonogramKatanaItemName } from '@aneuhold/core-ts-db-lib';
  import { NonogramKatanaItemMapService } from '../../../../services/NonogramKatana/NonogramKatanaItemMapService';
  import { nonogramKatanaItemsDisplayInfo } from '../items/nonogramKatanaItemsDisplayInfo';

  export let itemName: NonogramKatanaItemName;
  export let requiredAmount: number;
  export let currentAmount: number;

  $: item = NonogramKatanaItemMapService.getItemStoreByName(itemName);
  $: itemDisplayInfo = nonogramKatanaItemsDisplayInfo[itemName];
  $: amountThatCanBeSpent = Math.min(
    Math.max(0, $item.currentAmount - ($item.minDesired ?? 0)),
    requiredAmount - currentAmount
  );
</script>

<li>
  {#if currentAmount === requiredAmount}
    ✅
  {/if}
  {itemDisplayInfo.displayName}:
  {currentAmount}/{requiredAmount}
  {#if currentAmount !== requiredAmount}
    (<b>{amountThatCanBeSpent}</b> can be spent now{amountThatCanBeSpent ===
    requiredAmount - currentAmount
      ? ' ✅'
      : ''})
  {/if}
</li>
