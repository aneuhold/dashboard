<!--
  @component
  
  This component is a singleton, and should only ever be used once. Use the
  exported functions to show the dialog.
-->
<script lang="ts" module>
  import InputBox from '$components/presentational/InputBox.svelte';
  import SmartDialog from '$components/presentational/SmartDialog.svelte';
  import Button, { Label } from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import { Actions, Content, Title } from '@smui/dialog';
  import { writable } from 'svelte/store';
  import { nonogramKatanaItemsDisplayInfo } from '../../../routes/entertainment/nonogramkatana/items/nonogramKatanaItemsDisplayInfo';
  import { nonogramKatanaUpgradesDisplayInfo } from '../../../routes/entertainment/nonogramkatana/upgrades/nonogramKatanaUpgradesDisplayInfo';
  import { NonogramKatanaUpgradeMapService } from '../../../services/NonogramKatana/NonogramKatanaUpgradeMapService';

  /**
   * A Nonogram Katana upgrade dialog which can be used anywhere in the app.
   */
  export const nonogramKatanaUpgradeDialog = {
    open: (upgradeId: string) => {
      currentUpgradeId.set(upgradeId);
      open.set(true);
    }
  };

  const currentUpgradeId = writable<string | null>(null);
  const open = writable(false);
</script>

<script lang="ts">
  import { NonogramKatanaItemName } from '@aneuhold/core-ts-db-lib';

  let upgrade = $derived($currentUpgradeId
    ? NonogramKatanaUpgradeMapService.getUpgradeStore($currentUpgradeId)
    : null);
  let displayInfo = $derived($upgrade ? nonogramKatanaUpgradesDisplayInfo[$upgrade.upgradeName] : null);

  function getItemAmount(itemName: NonogramKatanaItemName) {
    return $upgrade ? $upgrade.currentItemAmounts[itemName] : 0;
  }

  function updateItemToAmount(itemName: NonogramKatanaItemName, amount: number) {
    if ($upgrade) {
      $upgrade.currentItemAmounts[itemName] = amount;
    }
  }
</script>

<SmartDialog bind:open={$open}>
  {#if $upgrade && displayInfo}
    <Title>Update "{displayInfo.displayName}"</Title>
    <Content>
      <div class="content">
        {#if displayInfo.requiredItems.length > 0}
          {#each displayInfo.requiredItems as requiredItem}
            <Checkbox
              checked={getItemAmount(requiredItem.itemName) === requiredItem.requiredAmount}
              on:click={() => {
                if (getItemAmount(requiredItem.itemName) !== requiredItem.requiredAmount) {
                  updateItemToAmount(requiredItem.itemName, requiredItem.requiredAmount);
                } else {
                  updateItemToAmount(requiredItem.itemName, 0);
                }
                // might need a state update here.
              }}
            />
            <span class="mdc-typography--body1">
              {nonogramKatanaItemsDisplayInfo[requiredItem.itemName].displayName}
            </span>
            <InputBox
              bind:onBlurValue={$upgrade.currentItemAmounts[requiredItem.itemName]}
              inputType="number"
              min={0}
              max={requiredItem.requiredAmount}
              label="Current"
            />
            <span>Needed: {requiredItem.requiredAmount}</span>
          {/each}
        {/if}
      </div>
      <span>Priority: </span>
      <InputBox
        bind:onBlurValue={$upgrade.priority}
        inputType="number"
        max={100}
        label="Priority"
      />
    </Content>
    <Actions>
      <Button
        on:click={() => {
          $open = false;
        }}
      >
        <Label>Done</Label>
      </Button>
    </Actions>
  {/if}
</SmartDialog>

<style>
  .content {
    display: grid;
    grid-template-columns: min-content min-content 1fr min-content;
    align-items: center;
    gap: 8px;
  }
</style>
