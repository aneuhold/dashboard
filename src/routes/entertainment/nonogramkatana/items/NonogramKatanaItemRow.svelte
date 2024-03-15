<script lang="ts">
  import InputBox from '$components/presentational/InputBox.svelte';
  import { nonogramKatanaItemDialog } from '$components/singletons/dialogs/SingletonNonogramKatanaItemDialog.svelte';
  import Card, { Content as CardContent } from '@smui/card';
  import { Icon } from '@smui/common';
  import IconButton from '@smui/icon-button';
  import { NonogramKatanaItemMapService } from '../../../../services/NonogramKatana/NonogramKatanaItemMapService';
  import { NonogramKatanaUpgradeMapService } from '../../../../services/NonogramKatana/NonogramKatanaUpgradeMapService';
  import { nonogramKatanaItemDisplayInfo } from './+page.svelte';
  import NonogramKatanaRelatedUpgrade from './NonogramKatanaRelatedUpgrade.svelte';

  export let itemId: string;

  $: item = NonogramKatanaItemMapService.getItemStore(itemId);
  $: displayInfo = nonogramKatanaItemDisplayInfo[$item.itemName];
  $: upgradesThatRequireThisItem = NonogramKatanaUpgradeMapService.getUpgradeStoresByItemName(
    $item.itemName
  );
  $: amountThatCanBeSpent = $item.currentAmount - ($item.minDesired ?? 0);

  $: {
    console.log(upgradesThatRequireThisItem);
  }
</script>

<div class="container">
  <Card variant="outlined">
    <CardContent>
      <div class="card-content">
        <div class="left-side">
          {#if displayInfo.icon}
            <Icon class="material-icons">
              <svelte:component this={displayInfo.icon} size={30} />
            </Icon>
          {/if}
          <div>
            <h4 class="mdc-typography--body1 title">
              {displayInfo.displayName}
              <InputBox
                bind:onBlurValue={$item.currentAmount}
                inputType="number"
                min={0}
                max={$item.storageCap ?? undefined}
                label="Qty"
              />
              {#if $item.minDesired}
                <span class="mdc-typography--caption mdc-theme--text-hint-on-background">
                  Min Desired: <span class={$item.currentAmount < $item.minDesired ? 'error' : ''}>
                    {$item.minDesired}
                  </span>
                </span>
              {/if}
              {#if $item.maxDesired}
                <span class="mdc-typography--caption mdc-theme--text-hint-on-background">
                  Max Desired: <span class={$item.currentAmount > $item.maxDesired ? 'error' : ''}>
                    {$item.maxDesired}
                  </span>
                </span>
              {/if}
              {#if $item.storageCap}
                <span class="mdc-typography--caption mdc-theme--text-hint-on-background">
                  Storage Cap: {$item.storageCap}
                </span>
              {/if}
              <span class="mdc-typography--caption">
                Amount that can be spent now: {amountThatCanBeSpent}
              </span>
            </h4>
            {#if displayInfo.usedFor}
              <div class="mdc-typography--caption mdc-theme--text-hint-on-background dependencies">
                <span>Used for: </span>
                <ul class="dependencies-list">
                  {#if upgradesThatRequireThisItem.length > 0}
                    {#each upgradesThatRequireThisItem as upgrade}
                      <NonogramKatanaRelatedUpgrade
                        itemName={$item.itemName}
                        relatedUpgrade={upgrade}
                      />
                    {/each}
                  {/if}
                  {#each displayInfo.usedFor as usedFor}
                    <li>{usedFor}</li>
                  {/each}
                </ul>
              </div>
            {/if}
          </div>
        </div>
        <IconButton
          on:click={() => {
            nonogramKatanaItemDialog.open(itemId);
          }}><Icon class="material-icons dimmed-color">edit</Icon></IconButton
        >
      </div>
    </CardContent>
  </Card>
</div>

<style>
  .container {
    padding: 2px;
  }
  .title {
    margin-top: 0px;
    margin-bottom: 0px;
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .subtitle {
    margin-top: 4px;
    margin-bottom: 0px;
    text-wrap: wrap;
  }
  .card-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .left-side {
    display: flex;
    flex-direction: row;
    gap: 16px;
    align-items: center;
  }
  .dependencies {
    margin-top: 4px;
  }
  .dependencies-list {
    margin-top: 0px;
    margin-bottom: 0px;
    padding-inline-start: 20px;
  }
  .error {
    color: var(--error);
  }
</style>
