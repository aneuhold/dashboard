<script lang="ts">
  import Card, { Content as CardContent } from '@smui/card';
  import { Icon } from '@smui/common';
  import IconButton from '@smui/icon-button';
  import InputBox from '$components/presentational/InputBox/InputBox.svelte';
  import { nonogramKatanaItemDialog } from '$components/singletons/dialogs/SingletonNonogramKatanaItemDialog.svelte';
  import { NonogramKatanaItemMapService } from '$services/NonogramKatana/NonogramKatanaItemMapService';
  import { NonogramKatanaUpgradeMapService } from '$services/NonogramKatana/NonogramKatanaUpgradeMapService';
  import { nonogramKatanaItemsDisplayInfo } from './nonogramKatanaItemsDisplayInfo';
  import NonogramKatanaRelatedUpgrade from './NonogramKatanaRelatedUpgrade.svelte';

  let { itemId }: { itemId: string } = $props();

  let item = $derived(NonogramKatanaItemMapService.getItemStore(itemId));
  let displayInfo = $derived(nonogramKatanaItemsDisplayInfo[$item.itemName]);
  let upgradesThatRequireThisItem = $derived(
    NonogramKatanaUpgradeMapService.getUpgradeStoresByItemName($item.itemName)
  );
  let amountThatCanBeSpent = $derived($item.currentAmount - ($item.minDesired ?? 0));
</script>

<div class="container">
  <Card variant="outlined">
    <CardContent>
      <div class="card-content">
        <div class="left-side">
          {#if displayInfo.icon}
            <Icon class="material-icons">
              <displayInfo.icon size={30} />
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
            {#if displayInfo.usedFor || upgradesThatRequireThisItem.length > 0}
              <div class="mdc-typography--caption mdc-theme--text-hint-on-background dependencies">
                <span>Used for: </span>
                <ul class="dependencies-list">
                  {#if upgradesThatRequireThisItem.length > 0}
                    {#each upgradesThatRequireThisItem as upgrade, i (i)}
                      <NonogramKatanaRelatedUpgrade
                        itemName={$item.itemName}
                        relatedUpgrade={upgrade}
                      />
                    {/each}
                  {/if}
                  {#if displayInfo.usedFor && displayInfo.usedFor.length > 0}
                    {#each displayInfo.usedFor as usedFor (usedFor)}
                      <li>{usedFor}</li>
                    {/each}
                  {/if}
                </ul>
              </div>
            {/if}
            {#if displayInfo.collectedFrom && displayInfo.collectedFrom.length > 0}
              <div class="mdc-typography--caption mdc-theme--text-hint-on-background dependencies">
                <span>Acquired from: </span>
                <ul class="dependencies-list">
                  {#each displayInfo.collectedFrom as collectedFrom (collectedFrom)}
                    <li>{collectedFrom}</li>
                  {/each}
                </ul>
              </div>
            {/if}
          </div>
        </div>
        <IconButton
          onclick={() => {
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
