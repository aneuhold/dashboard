<script lang="ts" context="module">
  import PageTitle from '$components/PageTitle.svelte';
  import { NonogramKatanaUpgradeName } from '@aneuhold/core-ts-db-lib';
  import Paper, { Content } from '@smui/paper';
  import type { ComponentType } from 'svelte';
  import { NonogramKatanaUpgradeMapService } from '../../../../services/NonogramKatana/NonogramKatanaUpgradeMapService';
  import NonogramKatanaUpgradeRow from './NonogramKatanaUpgradeRow.svelte';
  import { nonogramKatanaUpgradesPageInfo } from './pageInfo';

  export type NonogramKatanaUpgradeDisplayInfo = {
    displayName: string;
    requiredUpgrades: NonogramKatanaUpgradeName[];
    icon?: ComponentType;
  };

  export const nonogramKatanaUpgradesDisplayInfo: Record<
    NonogramKatanaUpgradeName,
    NonogramKatanaUpgradeDisplayInfo
  > = {
    [NonogramKatanaUpgradeName.BuildingGuildLvl2]: {
      displayName: 'Guild Lvl 2',
      requiredUpgrades: []
    },
    [NonogramKatanaUpgradeName.BuildingGuildLvl3]: {
      displayName: 'Guild Lvl 3',
      requiredUpgrades: [NonogramKatanaUpgradeName.BuildingGuildLvl2]
    },
    [NonogramKatanaUpgradeName.BuildingGuildLvl4]: {
      displayName: 'Guild Lvl 4',
      requiredUpgrades: [NonogramKatanaUpgradeName.BuildingGuildLvl3]
    },
    [NonogramKatanaUpgradeName.BuildingGuildLvl5]: {
      displayName: 'Guild Lvl 5',
      requiredUpgrades: [NonogramKatanaUpgradeName.BuildingGuildLvl4]
    },
    [NonogramKatanaUpgradeName.BuildingWarehouseLvl1]: {
      displayName: 'Warehouse Lvl 1',
      requiredUpgrades: []
    },
    [NonogramKatanaUpgradeName.BuildingWarehouseLvl2]: {
      displayName: 'Warehouse Lvl 2',
      requiredUpgrades: [
        NonogramKatanaUpgradeName.BuildingWarehouseLvl1,
        NonogramKatanaUpgradeName.BuildingGuildLvl2
      ]
    },
    [NonogramKatanaUpgradeName.BuildingWarehouseLvl3]: {
      displayName: 'Warehouse Lvl 3',
      requiredUpgrades: [
        NonogramKatanaUpgradeName.BuildingWarehouseLvl2,
        NonogramKatanaUpgradeName.BuildingGuildLvl3
      ]
    }
  };
</script>

<script lang="ts">
  import Button from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import { flip } from 'svelte/animate';
  import { slide } from 'svelte/transition';
  import { userSettings } from '../../../../stores/userSettings';

  let upgradeMap = NonogramKatanaUpgradeMapService.getStore();
  let showAll = false;
  $: allUpgrades = Object.values($upgradeMap);
  $: workableUpgrades = Object.values(
    NonogramKatanaUpgradeMapService.getWorkableUpgrades($upgradeMap)
  );
  $: currentlyShownUpgrades = showAll ? allUpgrades : workableUpgrades;
</script>

<svelte:head>
  <title>{nonogramKatanaUpgradesPageInfo.shortTitle}</title>
  <meta name="description" content={nonogramKatanaUpgradesPageInfo.description} />
</svelte:head>

<PageTitle
  title={nonogramKatanaUpgradesPageInfo.shortTitle}
  subtitle={nonogramKatanaUpgradesPageInfo.description}
/>
<div class="content">
  <Paper>
    <Content>
      <div class="topSettingsRow">
        <Button
          on:click={() => {
            NonogramKatanaUpgradeMapService.createOrUpdateUpgrades($userSettings.config.userId);
          }}
        >
          Add / Update Upgrades
        </Button>
        <div class="showAllSetting">
          Show all upgrades
          <Checkbox bind:checked={showAll} touch />
        </div>
      </div>
      {#if currentlyShownUpgrades.length > 0}
        {#each currentlyShownUpgrades as upgrade (upgrade.upgradeName)}
          <div transition:slide animate:flip={{ duration: 200 }}>
            <NonogramKatanaUpgradeRow upgradeName={upgrade.upgradeName} />
          </div>
        {/each}
      {/if}
    </Content>
  </Paper>
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .topSettingsRow {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
  }
  .showAllSetting {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
</style>
