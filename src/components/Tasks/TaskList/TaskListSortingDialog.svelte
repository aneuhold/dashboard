<script lang="ts">
  import { run } from 'svelte/legacy';

  import SmartDialog from '$components/presentational/SmartDialog.svelte';
  import {
    DashboardTaskSortBy,
    DashboardTaskSortDirection,
    type DashboardTaskListSortSettings
  } from '@aneuhold/core-ts-db-lib';
  import Button, { Label } from '@smui/button';
  import { Actions, Content, Title } from '@smui/dialog';
  import { createEventDispatcher } from 'svelte';
  import { flip } from 'svelte/animate';
  import { slide } from 'svelte/transition';
  import TaskSortSetting from './TaskSortSetting.svelte';

  interface Props {
    open: boolean;
    initialSettings: DashboardTaskListSortSettings;
  }

  let { open = $bindable(), initialSettings }: Props = $props();

  let currentSettings: DashboardTaskListSortSettings = $state();
  let previousOpen = $state(false);

  const dispatch = createEventDispatcher<{
    updateSettings: DashboardTaskListSortSettings;
    reset: unknown;
  }>();

  const handleDone = () => {
    dispatch('updateSettings', currentSettings);
    open = false;
  };
  const handleCancel = () => {
    open = false;
  };
  const handleReset = () => {
    dispatch('reset');
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

  const handleEnable = (event: CustomEvent<DashboardTaskSortBy>) => {
    const sortBy = event.detail;
    currentSettings.sortList.push({
      sortBy,
      sortDirection: DashboardTaskSortDirection.descending
    });
    currentSortList = currentSettings.sortList;
    disabledSortSettings = getDisabledSortSettings(currentSettings);
  };
  const handleDisable = (event: CustomEvent<DashboardTaskSortBy>) => {
    const sortBy = event.detail;
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
   * @param event
   */
  const handleIncrement = (event: CustomEvent<DashboardTaskSortBy>) => {
    const sortBy = event.detail;
    const sortList = currentSettings.sortList;
    const settingIndex = sortList.findIndex((sortSetting) => sortSetting.sortBy === sortBy);
    if (settingIndex === -1 || settingIndex === 0) return;
    // Swap elements
    moveSortSetting(settingIndex, settingIndex - 1);
  };
  const handleDecrement = (event: CustomEvent<DashboardTaskSortBy>) => {
    const sortBy = event.detail;
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
  run(() => {
    currentSettings = JSON.parse(JSON.stringify(initialSettings)) as DashboardTaskListSortSettings;
  });
  run(() => {
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
          on:disable={handleDisable}
          on:incrementPriority={handleIncrement}
          on:decrementPriority={handleDecrement}
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
          on:enable={handleEnable}
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
