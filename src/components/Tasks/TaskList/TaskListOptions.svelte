<script lang="ts">
  import {
    DashboardTask,
    getDefaultTaskListFilterSettings,
    type DashboardTaskListFilterSettings,
    type DashboardTaskListSortSettings
  } from '@aneuhold/core-ts-db-lib';
  import ClickableDiv from 'components/presentational/ClickableDiv.svelte';
  import SquareIconButton from 'components/presentational/SquareIconButton.svelte';
  import type { DocumentStore } from '../../../services/DocumentMapStoreService';
  import { currentUserId } from '../../../stores/derived/currentUserId';
  import { userSettings } from '../../../stores/userSettings';
  import TaskListSortingDialog from './TaskListSortingDialog.svelte';

  export let category: string;
  export let parentTask: DocumentStore<DashboardTask> | undefined = undefined;
  export let parentTaskSortSettings: DashboardTaskListSortSettings | undefined = undefined;
  export let userTaskSortSettings: DashboardTaskListSortSettings | undefined = undefined;
  export let currentSortSettings: DashboardTaskListSortSettings;

  $: parentTaskFilterSettings = $parentTask
    ? $parentTask.filterSettings[$currentUserId]
    : undefined;
  $: userTaskFilterSettings = $userSettings.config.taskListFilterSettings[category];
  $: currentFilterSettings =
    parentTaskFilterSettings ??
    userTaskFilterSettings ??
    getDefaultTaskListFilterSettings($currentUserId);
  $: sortingDimmed = $parentTask ? !parentTaskSortSettings : !userTaskSortSettings;
  $: filterDimmed = $parentTask ? !parentTaskFilterSettings : !userTaskFilterSettings;
  $: taskSpecificText = getTaskSpecificText({
    parentTask: $parentTask,
    parentTaskSortSettings,
    parentTaskFilterSettings
  });

  let sortingDialogOpen = false;

  const getTaskSpecificText = (settingsInfo: {
    parentTask?: DashboardTask;
    parentTaskSortSettings?: DashboardTaskListSortSettings;
    parentTaskFilterSettings?: DashboardTaskListFilterSettings;
  }) => {
    const { parentTask, parentTaskSortSettings, parentTaskFilterSettings } = settingsInfo;
    if (parentTask) {
      if (parentTaskSortSettings && parentTaskFilterSettings) {
        return 'Task-specific sort + filter';
      } else if (parentTaskSortSettings) {
        return 'Task-specific sort';
      } else if (parentTaskFilterSettings) {
        return 'Task-specific filter';
      }
    }
    return '';
  };

  const handleUpdateSortSettings = (event: CustomEvent<DashboardTaskListSortSettings>) => {
    const newSortSettings = event.detail;
    if ($parentTask) {
      $parentTask.sortSettings[$currentUserId] = newSortSettings;
    } else {
      $userSettings.config.taskListSortSettings[category] = newSortSettings;
      userSettings.saveSettings();
    }
  };
  const handleResetSortSettings = () => {
    if ($parentTask) {
      const sortSettings = $parentTask.sortSettings;
      delete sortSettings[$currentUserId];
      $parentTask.sortSettings = sortSettings;
    } else {
      const sortSettings = $userSettings.config.taskListSortSettings;
      delete sortSettings[category];
      $userSettings.config.taskListSortSettings = sortSettings;
      userSettings.saveSettings();
    }
  };
</script>

<div class="container">
  <ClickableDiv
    clickAction={() => {
      sortingDialogOpen = true;
    }}
  >
    <SquareIconButton iconName="sort" variant="outlined" disabled={sortingDimmed} />
  </ClickableDiv>
  {#if $parentTask}
    <i class="dimmed-color">{taskSpecificText}</i>
  {/if}
  <ClickableDiv
    clickAction={() => {
      console.log('filter clicked');
    }}
  >
    <SquareIconButton iconName="filter_list" variant="outlined" disabled={filterDimmed} />
  </ClickableDiv>
</div>

<TaskListSortingDialog
  initialSettings={currentSortSettings}
  bind:open={sortingDialogOpen}
  on:updateSettings={handleUpdateSortSettings}
  on:reset={handleResetSortSettings}
/>

<style>
  .container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 8px;
    align-items: center;
  }
</style>
