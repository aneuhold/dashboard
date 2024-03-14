<script lang="ts">
  import InputBox from '$components/presentational/InputBox.svelte';
  import Card, { Content as CardContent } from '@smui/card';
  import { Icon } from '@smui/common';
  import IconButton from '@smui/icon-button';
  import { nonogramKatanaItemDisplayInfo, type NonogramKatanaItem } from './+page.svelte';

  export let item: NonogramKatanaItem;

  $: displayInfo = nonogramKatanaItemDisplayInfo[item.itemName];
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
                inputValue={item.currentAmount}
                inputType="number"
                min={0}
                max={item.storageCap}
                label="Qty"
              />
              {#if item.minDesired}
                <span class="mdc-typography--caption mdc-theme--text-hint-on-background">
                  Min Desired: <span class={item.currentAmount < item.minDesired ? 'error' : ''}>
                    {item.minDesired}
                  </span>
                </span>
              {/if}
              {#if item.maxDesired}
                <span class="mdc-typography--caption mdc-theme--text-hint-on-background">
                  Max Desired: <span class={item.currentAmount > item.maxDesired ? 'error' : ''}>
                    {item.maxDesired}
                  </span>
                </span>
              {/if}
              {#if item.storageCap}
                <span class="mdc-typography--caption mdc-theme--text-hint-on-background">
                  Storage Cap: {item.storageCap}
                </span>
              {/if}
            </h4>
            {#if displayInfo.usedFor}
              <div class="mdc-typography--caption mdc-theme--text-hint-on-background dependencies">
                <span>Used for: </span>
                <ul class="dependencies-list">
                  {#each displayInfo.usedFor as usedFor}
                    <li>{usedFor}</li>
                  {/each}
                </ul>
              </div>
            {/if}
          </div>
        </div>
        <IconButton><Icon class="material-icons dimmed-color">edit</Icon></IconButton>
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
