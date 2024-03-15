<!--
  @component
  
  This component is a singleton, and should only ever be used once. Use the
  exported functions to show the dialog.
-->
<script lang="ts" context="module">
  import SmartDialog from '$components/presentational/SmartDialog.svelte';
  import Button, { Label } from '@smui/button';
  import { Actions, Content, Title } from '@smui/dialog';
  import { writable } from 'svelte/store';

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
  import InputBox from '$components/presentational/InputBox.svelte';
  import Checkbox from '@smui/checkbox';
  import { nonogramKatanaItemDisplayInfo } from '../../../routes/entertainment/nonogramkatana/items/+page.svelte';
  import { nonogramKatanaUpgradesDisplayInfo } from '../../../routes/entertainment/nonogramkatana/upgrades/+page.svelte';
  import { NonogramKatanaUpgradeMapService } from '../../../services/NonogramKatana/NonogramKatanaUpgradeMapService';

  $: upgrade = $currentUpgradeId
    ? NonogramKatanaUpgradeMapService.getUpgradeStore($currentUpgradeId)
    : null;
  $: displayInfo = $upgrade ? nonogramKatanaUpgradesDisplayInfo[$upgrade.upgradeName] : null;
</script>

<SmartDialog bind:open={$open}>
  {#if $upgrade && displayInfo}
    <Title>Update "{displayInfo.displayName}"</Title>
    <Content>
      <div class="content">
        {#if $upgrade.requiredItems.length > 0}
          {#each $upgrade.requiredItems as requiredItem}
            <Checkbox
              checked={requiredItem.currentAmount === requiredItem.requiredAmount}
              on:click={() => {
                if (requiredItem.currentAmount !== requiredItem.requiredAmount) {
                  requiredItem.currentAmount = requiredItem.requiredAmount;
                } else {
                  requiredItem.currentAmount = 0;
                }
                if ($upgrade) {
                  // Just a state update
                  $upgrade.requiredItems = $upgrade.requiredItems;
                }
              }}
            />
            <span class="mdc-typography--body1">
              {nonogramKatanaItemDisplayInfo[requiredItem.itemName].displayName}
            </span>
            <InputBox
              bind:onBlurValue={requiredItem.currentAmount}
              inputType="number"
              min={0}
              max={requiredItem.requiredAmount}
              label="Current"
            />
            <span>Needed: {requiredItem.requiredAmount}</span>
          {/each}
        {/if}
      </div>
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
