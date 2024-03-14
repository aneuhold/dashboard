<!--
  @component
  
  A page for entertainment things, like games and stuff like that.
-->
<script lang="ts" context="module">
  import PageTitle from '$components/PageTitle.svelte';
  import Paper, { Content } from '@smui/paper';
  import type { ComponentType } from 'svelte';
  import NonogramKatanaItemRow from './NonogramKatanaItemRow.svelte';
  import { nonogramKatanaItemsPageInfo } from './pageInfo';

  export enum NonogramKatanaItemName {
    Coin = 'coin',
    CryptoCoin = 'cryptoCoin',
    Ruby = 'ruby',
    Fan = 'fan',
    Arrows = 'arrows',
    Katana = 'katana',
    Shuriken = 'shuriken',
    Spikes = 'spikes',
    Boomerang = 'boomerang',
    Petard = 'petard',
    Bomb = 'bomb',
    Firework = 'firework',
    BatteringRam = 'batteringRam',
    Anchor = 'anchor',
    Wood = 'wood',
    Stone = 'stone',
    Steel = 'steel'
  }

  /**
   * This might be the thing that is stored in the DB.
   */
  export type NonogramKatanaItem = {
    itemName: NonogramKatanaItemName;
    currentAmount: number;
    storageCap?: number;
    minDesired?: number;
    maxDesired?: number;
    priority?: number;
  };

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
    [NonogramKatanaItemName.Stone]: {
      displayName: 'Stone'
    },
    [NonogramKatanaItemName.Steel]: {
      displayName: 'Steel'
    }
  };

  const nonogramKatanaDefaultItems: { [key in NonogramKatanaItemName]: NonogramKatanaItem } = {
    [NonogramKatanaItemName.Coin]: {
      itemName: NonogramKatanaItemName.Coin,
      currentAmount: 163,
      storageCap: 1360,
      priority: 1
    },
    [NonogramKatanaItemName.CryptoCoin]: {
      itemName: NonogramKatanaItemName.CryptoCoin,
      currentAmount: 328,
      storageCap: 1360
    },
    [NonogramKatanaItemName.Ruby]: {
      itemName: NonogramKatanaItemName.Ruby,
      currentAmount: 35,
      storageCap: 1360
    },
    [NonogramKatanaItemName.Fan]: {
      itemName: NonogramKatanaItemName.Fan,
      currentAmount: 62,
      storageCap: 136
    },
    [NonogramKatanaItemName.Arrows]: {
      itemName: NonogramKatanaItemName.Arrows,
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Katana]: {
      itemName: NonogramKatanaItemName.Katana,
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Shuriken]: {
      itemName: NonogramKatanaItemName.Shuriken,
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Spikes]: {
      itemName: NonogramKatanaItemName.Spikes,
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Boomerang]: {
      itemName: NonogramKatanaItemName.Boomerang,
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Petard]: {
      itemName: NonogramKatanaItemName.Petard,
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Bomb]: {
      itemName: NonogramKatanaItemName.Bomb,
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Firework]: {
      itemName: NonogramKatanaItemName.Firework,
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.BatteringRam]: {
      itemName: NonogramKatanaItemName.BatteringRam,
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Anchor]: {
      itemName: NonogramKatanaItemName.Anchor,
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Wood]: {
      itemName: NonogramKatanaItemName.Wood,
      currentAmount: 0,
      storageCap: 100,
      minDesired: 50,
      maxDesired: 100
    },
    [NonogramKatanaItemName.Stone]: {
      itemName: NonogramKatanaItemName.Stone,
      currentAmount: 0,
      storageCap: 100,
      minDesired: 50,
      maxDesired: 100
    },
    [NonogramKatanaItemName.Steel]: {
      itemName: NonogramKatanaItemName.Steel,
      currentAmount: 0,
      storageCap: 100,
      minDesired: 50,
      maxDesired: 100
    }
  };
</script>

<script lang="ts">
  // What should be the data structure for the info here?
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
      {#each Object.values(nonogramKatanaDefaultItems) as item}
        <NonogramKatanaItemRow {item} />
      {/each}
    </Content>
  </Paper>
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
