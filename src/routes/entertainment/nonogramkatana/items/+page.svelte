<!--
  @component
  
  A page for entertainment things, like games and stuff like that.
-->
<script lang="ts" context="module">
  import PageTitle from '$components/PageTitle.svelte';
  import Paper, { Content, Title } from '@smui/paper';
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

  export type NonogramKatanaItem = {
    itemName: NonogramKatanaItemName;
    displayName: string;
    currentAmount: number;
    storageCap?: number;
    minDesired?: number;
    maxDesired?: number;
    priority?: number;
  };

  const nonogramKatanaDefaultItems: { [key in NonogramKatanaItemName]: NonogramKatanaItem } = {
    [NonogramKatanaItemName.Coin]: {
      itemName: NonogramKatanaItemName.Coin,
      displayName: 'Coin',
      currentAmount: 163,
      storageCap: 1360,
      priority: 1
    },
    [NonogramKatanaItemName.CryptoCoin]: {
      itemName: NonogramKatanaItemName.CryptoCoin,
      displayName: 'Crypto-coin',
      currentAmount: 328,
      storageCap: 1360
    },
    [NonogramKatanaItemName.Ruby]: {
      itemName: NonogramKatanaItemName.Ruby,
      displayName: 'Ruby',
      currentAmount: 35,
      storageCap: 1360
    },
    [NonogramKatanaItemName.Fan]: {
      itemName: NonogramKatanaItemName.Fan,
      displayName: 'Fan',
      currentAmount: 62,
      storageCap: 136
    },
    [NonogramKatanaItemName.Arrows]: {
      itemName: NonogramKatanaItemName.Arrows,
      displayName: 'Arrows',
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Katana]: {
      itemName: NonogramKatanaItemName.Katana,
      displayName: 'Katana',
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Shuriken]: {
      itemName: NonogramKatanaItemName.Shuriken,
      displayName: 'Shuriken',
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Spikes]: {
      itemName: NonogramKatanaItemName.Spikes,
      displayName: 'Spikes',
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Boomerang]: {
      itemName: NonogramKatanaItemName.Boomerang,
      displayName: 'Boomerang',
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Petard]: {
      itemName: NonogramKatanaItemName.Petard,
      displayName: 'Petard',
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Bomb]: {
      itemName: NonogramKatanaItemName.Bomb,
      displayName: 'Bomb',
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Firework]: {
      itemName: NonogramKatanaItemName.Firework,
      displayName: 'Firework',
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.BatteringRam]: {
      itemName: NonogramKatanaItemName.BatteringRam,
      displayName: 'Battering Ram',
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Anchor]: {
      itemName: NonogramKatanaItemName.Anchor,
      displayName: 'Anchor',
      currentAmount: 0,
      storageCap: 136
    },
    [NonogramKatanaItemName.Wood]: {
      itemName: NonogramKatanaItemName.Wood,
      displayName: 'Wood',
      currentAmount: 0,
      storageCap: 100,
      minDesired: 50,
      maxDesired: 100
    },
    [NonogramKatanaItemName.Stone]: {
      itemName: NonogramKatanaItemName.Stone,
      displayName: 'Stone',
      currentAmount: 0,
      storageCap: 100,
      minDesired: 50,
      maxDesired: 100
    },
    [NonogramKatanaItemName.Steel]: {
      itemName: NonogramKatanaItemName.Steel,
      displayName: 'Steel',
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
    <Title>Something</Title>
    <Content>Something here</Content>
  </Paper>
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
