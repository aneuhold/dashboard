<script lang="ts">
  import SmartDialog from '$components/presentational/SmartDialog.svelte';
  import {
    DashboardTaskSortBy,
    DashboardTaskSortDirection,
    type DashboardTaskListSortSettings
  } from '@aneuhold/core-ts-db-lib';
  import Button, { Label } from '@smui/button';
  import { Actions, Content, Title } from '@smui/dialog';
  import { flip } from 'svelte/animate';
  import { slide } from 'svelte/transition';
  import TaskSortSetting from './TaskSortSetting.svelte';

  interface Props {
    open: boolean;
    initialSettings: DashboardTaskListSortSettings;
    onUpdateSettings?: (settings: DashboardTaskListSortSettings) => void;
    onReset?: () => void;
  }

  let { open = $bindable(), initialSettings, onUpdateSettings, onReset }: Props = $props();

  let currentSettings: DashboardTaskListSortSettings = $state(
    JSON.parse(JSON.stringify(initialSettings)) as DashboardTaskListSortSettings
  );
  let previousOpen = $state(false);

  const handleDone = () => {
    onUpdateSettings?.(currentSettings);
    open = false;
  };
  const handleCancel = () => {
    open = false;
  };
  const handleReset = () => {
    onReset?.();
    open = false;
  };
  const getDisabledSortSettings = (
    settings: DashboardTaskListSortSettings
  ): DashboardTaskSortBy[] => {
    const disabledSettings = new Set(Object.keys(DashboardTaskSortBy));
    settings.sortList.forEach((sortSetting) => {
      disabledSettings.delete(sortSetting.sortBy);
    });
    return Array.from(disabledSettings) as DashboardTaskSortBy[];
  };

  const handleEnable = (sortBy: DashboardTaskSortBy) => {
    currentSettings.sortList.push({
      sortBy,
      sortDirection: DashboardTaskSortDirection.descending
    });
    currentSortList = currentSettings.sortList;
    disabledSortSettings = getDisabledSortSettings(currentSettings);
  };
  const handleDisable = (sortBy: DashboardTaskSortBy) => {
    currentSettings.sortList = currentSettings.sortList.filter(
      (sortSetting) => sortSetting.sortBy !== sortBy
    );
    currentSortList = currentSettings.sortList;
    disabledSortSettings = getDisabledSortSettings(currentSettings);
  };

  /**
   * Moves the sort setting up in priority.
   *
   * This is opposite of what you would expect, because the sort settings are
   * ordered in descending priority.
   *
   * @param sortBy
   */
  const handleIncrement = (sortBy: DashboardTaskSortBy) => {
    const sortList = currentSettings.sortList;
    const settingIndex = sortList.findIndex((sortSetting) => sortSetting.sortBy === sortBy);
    if (settingIndex === -1 || settingIndex === 0) return;
    // Swap elements
    moveSortSetting(settingIndex, settingIndex - 1);
  };
  const handleDecrement = (sortBy: DashboardTaskSortBy) => {
    const sortList = currentSettings.sortList;
    const settingIndex = sortList.findIndex((sortSetting) => sortSetting.sortBy === sortBy);
    if (settingIndex === -1 || settingIndex === sortList.length - 1) return;
    // Swap elements
    moveSortSetting(settingIndex, settingIndex + 1);
  };

  const moveSortSetting = (fromIndex: number, toIndex: number) => {
    const sortList = currentSettings.sortList;
    const temp = sortList[fromIndex];
    sortList[fromIndex] = sortList[toIndex];
    sortList[toIndex] = temp;
    currentSettings.sortList = sortList;
    currentSortList = sortList;
  };
  $effect(() => {
    currentSettings = JSON.parse(JSON.stringify(initialSettings)) as DashboardTaskListSortSettings;
  });
  $effect(() => {
    if (open !== previousOpen) {
      currentSettings = JSON.parse(
        JSON.stringify(initialSettings)
      ) as DashboardTaskListSortSettings;
      currentSortList = currentSettings.sortList;
      disabledSortSettings = getDisabledSortSettings(currentSettings);
    }
    previousOpen = open;
  });
  let currentSortList = $derived(currentSettings.sortList);
  let disabledSortSettings = $derived(getDisabledSortSettings(currentSettings));
</script>

<SmartDialog bind:open>
  <Title>Task Sorting Options</Title>
  <Content>
    {#each currentSortList as sortSetting (sortSetting.sortBy)}
      <div animate:flip={{ duration: 250 }} transition:slide>
        <TaskSortSetting
          {sortSetting}
          disabled={false}
          onDisable={handleDisable}
          onIncrementPriority={handleIncrement}
          onDecrementPriority={handleDecrement}
        />
      </div>
    {/each}
    {#each disabledSortSettings as disabledSetting (disabledSetting)}
      <div transition:slide>
        <TaskSortSetting
          sortSetting={{
            sortBy: disabledSetting,
            sortDirection: DashboardTaskSortDirection.descending
          }}
          onEnable={handleEnable}
          disabled={true}
        />
      </div>
    {/each}
  </Content>
  <Actions>
    <Button color="secondary" on:click={handleReset}>
      <Label>Reset</Label>
    </Button>
    <Button on:click={handleCancel}>
      <Label>Cancel</Label>
    </Button>
    <Button on:click={handleDone}>
      <Label>Done</Label>
    </Button>
  </Actions>
</SmartDialog>

<style>
</style>
