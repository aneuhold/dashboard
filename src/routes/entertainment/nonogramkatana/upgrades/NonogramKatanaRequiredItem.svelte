<script lang="ts">
  import { NonogramKatanaItemName } from '@aneuhold/core-ts-db-lib';
  import { NonogramKatanaItemMapService } from '$services/NonogramKatana/NonogramKatanaItemMapService';
  import { nonogramKatanaItemsDisplayInfo } from '../items/nonogramKatanaItemsDisplayInfo';

  let {
    itemName,
    requiredAmount,
    currentAmount
  }: {
    itemName: NonogramKatanaItemName;
    requiredAmount: number;
    currentAmount: number;
  } = $props();

  let item = $derived(NonogramKatanaItemMapService.getItemStoreByName(itemName));
  let itemDisplayInfo = $derived(nonogramKatanaItemsDisplayInfo[itemName]);
  let amountThatCanBeSpent = $derived(
    Math.min(
      Math.max(0, $item.currentAmount - ($item.minDesired ?? 0)),
      requiredAmount - currentAmount
    )
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
