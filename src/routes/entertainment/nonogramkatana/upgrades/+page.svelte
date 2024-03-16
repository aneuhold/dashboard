<script lang="ts" context="module">
  import PageTitle from '$components/PageTitle.svelte';
  import { NonogramKatanaUpgrade } from '@aneuhold/core-ts-db-lib';
  import Paper, { Content } from '@smui/paper';
  import { NonogramKatanaUpgradeMapService } from '../../../../services/NonogramKatana/NonogramKatanaUpgradeMapService';
  import NonogramKatanaUpgradeRow from './NonogramKatanaUpgradeRow.svelte';
  import { nonogramKatanaUpgradesPageInfo } from './pageInfo';
</script>

<script lang="ts">
  import SingletonNonogramKatanaUpgradeDialog from '$components/singletons/dialogs/SingletonNonogramKatanaUpgradeDialog.svelte';
  import Button from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import { flip } from 'svelte/animate';
  import { slide } from 'svelte/transition';
  import { userSettings } from '../../../../stores/userSettings';

  const sortFunction: (a: NonogramKatanaUpgrade, b: NonogramKatanaUpgrade) => number = (a, b) =>
    b.priority - a.priority;

  let upgradeMap = NonogramKatanaUpgradeMapService.getStore();
  let showAll = false;
  $: allUpgrades = Object.values($upgradeMap).sort(sortFunction);
  $: workableUpgrades = Object.values(
    NonogramKatanaUpgradeMapService.getWorkableUpgrades($upgradeMap)
  ).sort(sortFunction);
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
<SingletonNonogramKatanaUpgradeDialog />

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
