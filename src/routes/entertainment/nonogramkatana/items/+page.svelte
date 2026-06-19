<script lang="ts">
  import { NonogramKatanaItemName } from '@aneuhold/core-ts-db-lib';
  import Button from '@smui/button';
  import Paper, { Content } from '@smui/paper';
  import { flip } from 'svelte/animate';
  import PageTitle from '$components/PageTitle.svelte';
  import InputBox from '$components/presentational/InputBox/InputBox.svelte';
  import SingletonNonogramKatanaItemDialog from '$components/singletons/dialogs/SingletonNonogramKatanaItemDialog.svelte';
  import nonogramKatanaItemMapService from '$services/NonogramKatana/NonogramKatanaItemMap.service';
  import { userConfig } from '$stores/local/userConfig/userConfig';
  import NonogramKatanaItemRow from './NonogramKatanaItemRow.svelte';
  import { nonogramKatanaItemsPageInfo } from './pageInfo';

  let searchInput = $state('');
  let items = $derived(
    nonogramKatanaItemMapService.allDocs
      .filter((item) => item.itemName.toLowerCase().includes(searchInput.toLowerCase().trim()))
      .sort((a, b) => b.priority - a.priority)
  );
  let itemsMissing = $derived(
    Object.values(nonogramKatanaItemMapService.mapState).length <
      Object.values(NonogramKatanaItemName).length
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
            nonogramKatanaItemMapService.createOrUpdateItems($userConfig.config.userId);
          }}
        >
          Add / Update Items with defaults
        </Button>
      {/if}
      <div class="searchBox">
        <InputBox label="Search" bind:inputValue={searchInput} />
      </div>
      {#if items.length > 0}
        {#each items as item (item._id)}
          <div animate:flip={{ duration: 200 }}>
            <NonogramKatanaItemRow itemId={item._id} />
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
