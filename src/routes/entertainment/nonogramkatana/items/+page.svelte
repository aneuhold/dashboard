<script lang="ts">
  import { NonogramKatanaItem, NonogramKatanaItemName } from '@aneuhold/core-ts-db-lib';
  import Button from '@smui/button';
  import Paper, { Content } from '@smui/paper';
  import { flip } from 'svelte/animate';
  import PageTitle from '$components/PageTitle.svelte';
  import { InputBox } from '$components/presentational';
  import SingletonNonogramKatanaItemDialog from '$components/singletons/dialogs/SingletonNonogramKatanaItemDialog.svelte';
  import { userSettings } from '$stores/userSettings/userSettings';
  import { NonogramKatanaItemMapService } from '../../../../services/NonogramKatana/NonogramKatanaItemMapService';
  import NonogramKatanaItemRow from './NonogramKatanaItemRow.svelte';
  import { nonogramKatanaItemsPageInfo } from './pageInfo';

  const itemMap = NonogramKatanaItemMapService.getStore();
  let searchInput = $state('');
  let items = $derived(
    Object.values($itemMap)
      .filter(
        (item) =>
          item !== undefined &&
          item.itemName.toLowerCase().includes(searchInput.toLowerCase().trim())
      )
      .sort((a, b) => {
        if (!a) {
          return 1;
        } else if (!b) {
          return -1;
        }
        return b.priority - a.priority;
      }) as NonogramKatanaItem[]
  );
  let itemsMissing = $derived(
    Object.values($itemMap).length < Object.values(NonogramKatanaItemName).length
  );
</script>

<svelte:head>
  <title>{nonogramKatanaItemsPageInfo.shortTitle}</title>
  <meta name="description" content={nonogramKatanaItemsPageInfo.description} />
</svelte:head>

<PageTitle
  title={nonogramKatanaItemsPageInfo.shortTitle}
  subtitle={nonogramKatanaItemsPageInfo.description}
/>
<div class="content">
  <Paper>
    <Content>
      {#if itemsMissing}
        <Button
          onclick={() => {
            NonogramKatanaItemMapService.createOrUpdateItems($userSettings.config.userId);
          }}
        >
          Add / Update Items with defaults
        </Button>
      {/if}
      <div class="searchBox">
        <InputBox label="Search" bind:inputValue={searchInput} />
      </div>
      {#if items.length > 0}
        {#each items as item (item._id.toString())}
          <div animate:flip={{ duration: 200 }}>
            <NonogramKatanaItemRow itemId={item._id.toString()} />
          </div>
        {/each}
      {/if}
    </Content>
  </Paper>
</div>
<SingletonNonogramKatanaItemDialog />

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .searchBox {
    margin: 0px 16px 16px 16px;
    display: flex;
    flex-direction: column;
  }
</style>
