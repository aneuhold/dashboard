<script lang="ts" context="module">
  import PageTitle from '$components/PageTitle.svelte';
  import { NonogramKatanaItemName } from '@aneuhold/core-ts-db-lib';
  import Paper, { Content } from '@smui/paper';
  import type { ComponentType } from 'svelte';
  import { NonogramKatanaItemMapService } from '../../../../services/NonogramKatana/NonogramKatanaItemMapService';
  import NonogramKatanaItemRow from './NonogramKatanaItemRow.svelte';
  import { nonogramKatanaItemsPageInfo } from './pageInfo';

  type NonogramKatanaItemDisplayInfo = {
    displayName: string;
    icon?: ComponentType;
    usedFor?: string[];
  };

  /**
   * The display info for each item in the game.
   */
  export const nonogramKatanaItemDisplayInfo: {
    [key in NonogramKatanaItemName]: NonogramKatanaItemDisplayInfo;
  } = {
    [NonogramKatanaItemName.Coin]: {
      displayName: 'Coin',
      usedFor: ['Expeditions']
    },
    [NonogramKatanaItemName.CryptoCoin]: {
      displayName: 'Crypto-coin'
    },
    [NonogramKatanaItemName.Ruby]: {
      displayName: 'Ruby'
    },
    [NonogramKatanaItemName.Fan]: {
      displayName: 'Fan'
    },
    [NonogramKatanaItemName.Arrows]: {
      displayName: 'Arrows'
    },
    [NonogramKatanaItemName.Katana]: {
      displayName: 'Katana'
    },
    [NonogramKatanaItemName.Shuriken]: {
      displayName: 'Shuriken'
    },
    [NonogramKatanaItemName.Spikes]: {
      displayName: 'Spikes'
    },
    [NonogramKatanaItemName.Boomerang]: {
      displayName: 'Boomerang'
    },
    [NonogramKatanaItemName.Petard]: {
      displayName: 'Petard'
    },
    [NonogramKatanaItemName.Bomb]: {
      displayName: 'Bomb'
    },
    [NonogramKatanaItemName.Firework]: {
      displayName: 'Firework'
    },
    [NonogramKatanaItemName.BatteringRam]: {
      displayName: 'Battering Ram'
    },
    [NonogramKatanaItemName.Anchor]: {
      displayName: 'Anchor'
    },
    [NonogramKatanaItemName.Wood]: {
      displayName: 'Wood'
    },
    [NonogramKatanaItemName.WoodenBeam]: {
      displayName: 'Wooden Beam'
    },
    [NonogramKatanaItemName.WoodenPlank]: {
      displayName: 'Wooden Plank'
    },
    [NonogramKatanaItemName.Stone]: {
      displayName: 'Stone'
    },
    [NonogramKatanaItemName.Steel]: {
      displayName: 'Steel'
    },
    [NonogramKatanaItemName.MeteoricIron]: {
      displayName: 'Meteoric Iron'
    },
    [NonogramKatanaItemName.Charcoal]: {
      displayName: 'Charcoal'
    },
    [NonogramKatanaItemName.Gunpowder]: {
      displayName: 'Gunpowder'
    },
    [NonogramKatanaItemName.IronSand]: {
      displayName: 'Iron Sand'
    },
    [NonogramKatanaItemName.Chemicals]: {
      displayName: 'Chemicals'
    },
    [NonogramKatanaItemName.Thread]: {
      displayName: 'Thread'
    },
    [NonogramKatanaItemName.Pearl]: {
      displayName: 'Pearl'
    },
    [NonogramKatanaItemName.Rice]: {
      displayName: 'Rice'
    },
    [NonogramKatanaItemName.Wheat]: {
      displayName: 'Wheat'
    },
    [NonogramKatanaItemName.Flour]: {
      displayName: 'Flour'
    },
    [NonogramKatanaItemName.Egg]: {
      displayName: 'Egg'
    },
    [NonogramKatanaItemName.CoffeeBeans]: {
      displayName: 'Coffee Beans'
    },
    [NonogramKatanaItemName.Spices]: {
      displayName: 'Spices'
    },
    [NonogramKatanaItemName.Salmon]: {
      displayName: 'Salmon'
    },
    [NonogramKatanaItemName.Sushi]: {
      displayName: 'Sushi'
    },
    [NonogramKatanaItemName.FriedEggs]: {
      displayName: 'Fried Eggs'
    }
  };
</script>

<script lang="ts">
  import SingletonNonogramKatanaItemDialog from '$components/singletons/dialogs/SingletonNonogramKatanaItemDialog.svelte';
  import Button from '@smui/button';
  import { userSettings } from '../../../../stores/userSettings';

  let itemMap = NonogramKatanaItemMapService.getStore();
  $: items = Object.values($itemMap);
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
        {#each items as item}
          <NonogramKatanaItemRow {item} />
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
