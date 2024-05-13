<script lang="ts" context="module">
  import PageTitle from '$components/PageTitle.svelte';
  import { NonogramKatanaItem, NonogramKatanaItemName } from '@aneuhold/core-ts-db-lib';
  import Paper, { Content } from '@smui/paper';
  import { NonogramKatanaItemMapService } from '../../../../services/NonogramKatana/NonogramKatanaItemMapService';
  import NonogramKatanaItemRow from './NonogramKatanaItemRow.svelte';
  import { nonogramKatanaItemsPageInfo } from './pageInfo';
</script>

<script lang="ts">
  import SingletonNonogramKatanaItemDialog from '$components/singletons/dialogs/SingletonNonogramKatanaItemDialog.svelte';
  import Button from '@smui/button';
  import { flip } from 'svelte/animate';
  import { slide } from 'svelte/transition';
  import { userSettings } from '../../../../stores/userSettings';

  const itemMap = NonogramKatanaItemMapService.getStore();
  $: items = Object.values($itemMap)
    .filter((item) => item !== undefined)
    .sort((a, b) => {
      if (!a) {
        return 1;
      } else if (!b) {
        return -1;
      }
      return b.priority - a.priority;
    }) as NonogramKatanaItem[];
  $: itemsMissing = items.length < Object.values(NonogramKatanaItemName).length;
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
          on:click={() => {
            NonogramKatanaItemMapService.createOrUpdateItems($userSettings.config.userId);
          }}
        >
          Add / Update Items with defaults
        </Button>
      {/if}
      {#if items.length > 0}
        {#each items as item (item._id.toString())}
          <div transition:slide animate:flip={{ duration: 200 }}>
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
</style>
