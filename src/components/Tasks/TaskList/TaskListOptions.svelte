<script lang="ts">
  import ClickableDiv from '$components/presentational/ClickableDiv.svelte';
  import SquareIconButton from '$components/presentational/SquareIconButton.svelte';
  import { currentUserId } from '$stores/derived/currentUserId';
  import { userSettings } from '$stores/userSettings/userSettings';
  import {
    DashboardTask,
    getDefaultTaskListFilterSettings,
    type DashboardTaskListFilterSettings,
    type DashboardTaskListSortSettings
  } from '@aneuhold/core-ts-db-lib';
  import type { DocumentStore } from '../../../services/DocumentMapStoreService';
  import { TaskMapService } from '../../../services/Task/TaskMapService/TaskMapService';
  import TaskTagsService from '../../../services/Task/TaskTagsService';
  import TaskListFilterDialog from './TaskListFilterDialog.svelte';
  import TaskListSortingDialog from './TaskListSortingDialog.svelte';

  interface Props {
    category: string;
    parentTask?: DocumentStore<DashboardTask> | undefined;
    parentTaskSortSettings?: DashboardTaskListSortSettings | undefined;
    userTaskSortSettings?: DashboardTaskListSortSettings | undefined;
    currentSortSettings: DashboardTaskListSortSettings;
    removedTaskIds: string[];
  }

  let {
    category,
    parentTask = undefined,
    parentTaskSortSettings = undefined,
    userTaskSortSettings = undefined,
    currentSortSettings,
    removedTaskIds
  }: Props = $props();

  const globalTags = TaskTagsService.getStore();
  const taskMap = TaskMapService.getStore();


  let sortingDialogOpen = $state(false);
  let filterDialogOpen = $state(false);

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
    }
  };
  const handleUpdateFilterSettings = (event: CustomEvent<DashboardTaskListFilterSettings>) => {
    const newFilterSettings = event.detail;
    if ($parentTask) {
      $parentTask.filterSettings[$currentUserId] = newFilterSettings;
    } else {
      $userSettings.config.taskListFilterSettings[category] = newFilterSettings;
    }
  };
  const handleResetFilterSettings = () => {
    if ($parentTask) {
      const filterSettings = $parentTask.filterSettings;
      delete filterSettings[$currentUserId];
      $parentTask.filterSettings = filterSettings;
    } else {
      const filterSettings = $userSettings.config.taskListFilterSettings;
      delete filterSettings[category];
      $userSettings.config.taskListFilterSettings = filterSettings;
    }
  };
  let parentTaskFilterSettings = $derived($parentTask
    ? $parentTask.filterSettings[$currentUserId]
    : undefined);
  let userTaskFilterSettings = $derived($userSettings.config.taskListFilterSettings[category]);
  let currentFilterSettings =
    $derived(parentTaskFilterSettings ??
    userTaskFilterSettings ??
    getDefaultTaskListFilterSettings($currentUserId));
  let sortingDimmed = $derived($parentTask ? !parentTaskSortSettings : !userTaskSortSettings);
  let filterDimmed = $derived($parentTask ? !parentTaskFilterSettings : !userTaskFilterSettings);
  let taskSpecificText = $derived(getTaskSpecificText({
    parentTask: $parentTask,
    parentTaskSortSettings,
    parentTaskFilterSettings
  }));
  let tagsWithRemovedIds = $derived(removedTaskIds.reduce((tagSet, id) => {
    const task = $taskMap[id];
    const currentUserTags = task?.tags[$currentUserId];
    if (task && currentUserTags) {
      currentUserTags.forEach((tag) => tagSet.add(tag));
    }
    return tagSet;
  }, new Set<string>()));
  /**
   * Tags that are hidden, but only those that actually have tasks with removed
   * ids.
   */
  let hiddenTags = $derived($globalTags.filter(
    (tag) =>
      currentFilterSettings.tags[tag] &&
      !currentFilterSettings.tags[tag].show &&
      tagsWithRemovedIds.has(tag)
  ));
</script>

<div class="container">
  <ClickableDiv
    clickAction={() => {
      sortingDialogOpen = true;
    }}
  >
    <SquareIconButton iconName="sort" variant="outlined" disabled={sortingDimmed} />
  </ClickableDiv>
  {#if $parentTask || hiddenTags.length > 0}
    <div class="centerText dimmed-color">
      {#if $parentTask}
        <i>{taskSpecificText}</i>
      {/if}
      {#if hiddenTags.length > 0}
        <i class="mdc-typography--body2">{hiddenTags.join(', ')} Hidden</i>
      {/if}
    </div>
  {/if}

  <ClickableDiv
    clickAction={() => {
      filterDialogOpen = true;
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
<TaskListFilterDialog
  initialSettings={currentFilterSettings}
  bind:open={filterDialogOpen}
  on:updateSettings={handleUpdateFilterSettings}
  on:reset={handleResetFilterSettings}
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
  .centerText {
    display: flex;
    flex-direction: column;
    text-wrap: wrap;
    text-align: center;
  }
</style>
