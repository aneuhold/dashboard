<script lang="ts">
  import {
    DashboardTask,
    type DashboardTaskListFilterSettings,
    type DashboardTaskListSortSettings,
    getDefaultTaskListFilterSettings
  } from '@aneuhold/core-ts-db-lib';
  import ClickableDiv from '$components/presentational/ClickableDiv.svelte';
  import SquareIconButton from '$components/presentational/SquareIconButton.svelte';
  import { currentUserId } from '$stores/derived/currentUserId';
  import { userSettings } from '$stores/userSettings/userSettings';
  import type { DocumentStore } from '../../../services/DocumentMapStoreService';
  import { TaskMapService } from '../../../services/Task/TaskMapService/TaskMapService';
  import TaskTagsService from '../../../services/Task/TaskTagsService';
  import TaskListFilterDialog from './TaskListFilterDialog.svelte';
  import TaskListSortingDialog from './TaskListSortingDialog.svelte';

  let {
    category,
    parentTask,
    parentTaskSortSettings,
    userTaskSortSettings,
    currentSortSettings,
    removedTaskIds
  }: {
    category: string;
    parentTask?: DocumentStore<DashboardTask>;
    parentTaskSortSettings?: DashboardTaskListSortSettings;
    userTaskSortSettings?: DashboardTaskListSortSettings;
    currentSortSettings: DashboardTaskListSortSettings;
    removedTaskIds: string[];
  } = $props();

  const taskMap = TaskMapService.getStore();
  const globalTags = TaskTagsService.getStore(taskMap);

  let sortingDialogOpen = $state(false);
  let filterDialogOpen = $state(false);

  function getTaskSpecificText(settingsInfo: {
    parentTask?: DashboardTask;
    parentTaskSortSettings?: DashboardTaskListSortSettings;
    parentTaskFilterSettings?: DashboardTaskListFilterSettings;
  }) {
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
  }

  function handleUpdateSortSettings(newSortSettings: DashboardTaskListSortSettings) {
    if ($parentTask) {
      $parentTask.sortSettings[$currentUserId] = newSortSettings;
    } else {
      $userSettings.config.taskListSortSettings[category] = newSortSettings;
    }
  }
  function handleResetSortSettings() {
    if ($parentTask) {
      const sortSettings = $parentTask.sortSettings;
      delete sortSettings[$currentUserId];
      $parentTask.sortSettings = sortSettings;
    } else {
      const sortSettings = $userSettings.config.taskListSortSettings;
      delete sortSettings[category];
      $userSettings.config.taskListSortSettings = sortSettings;
    }
  }
  function handleUpdateFilterSettings(newFilterSettings: DashboardTaskListFilterSettings) {
    if ($parentTask) {
      $parentTask.filterSettings[$currentUserId] = newFilterSettings;
    } else {
      $userSettings.config.taskListFilterSettings[category] = newFilterSettings;
    }
  }
  function handleResetFilterSettings() {
    if ($parentTask) {
      const filterSettings = $parentTask.filterSettings;
      delete filterSettings[$currentUserId];
      $parentTask.filterSettings = filterSettings;
    } else {
      const filterSettings = $userSettings.config.taskListFilterSettings;
      delete filterSettings[category];
      $userSettings.config.taskListFilterSettings = filterSettings;
    }
  }
  let parentTaskFilterSettings = $derived(
    $parentTask ? $parentTask.filterSettings[$currentUserId] : undefined
  );
  let userTaskFilterSettings = $derived($userSettings.config.taskListFilterSettings[category]);
  let currentFilterSettings = $derived(
    parentTaskFilterSettings ??
      userTaskFilterSettings ??
      getDefaultTaskListFilterSettings($currentUserId)
  );
  let sortingDimmed = $derived($parentTask ? !parentTaskSortSettings : !userTaskSortSettings);
  let filterDimmed = $derived($parentTask ? !parentTaskFilterSettings : !userTaskFilterSettings);
  let taskSpecificText = $derived(
    getTaskSpecificText({
      parentTask: $parentTask,
      parentTaskSortSettings,
      parentTaskFilterSettings
    })
  );
  let tagsWithRemovedIds = $derived(
    removedTaskIds.reduce((tagSet, id) => {
      const task = $taskMap[id];
      const currentUserTags = task?.tags[$currentUserId];
      if (task && currentUserTags) {
        currentUserTags.forEach((tag) => tagSet.add(tag));
      }
      return tagSet;
    }, new Set<string>())
  );
  /**
   * Tags that are hidden, but only those that actually have tasks with removed
   * ids.
   */
  let hiddenTags = $derived(
    $globalTags.filter(
      (tag) =>
        currentFilterSettings.tags[tag] &&
        !currentFilterSettings.tags[tag].show &&
        tagsWithRemovedIds.has(tag)
    )
  );
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
  onUpdateSettings={handleUpdateSortSettings}
  onReset={handleResetSortSettings}
/>
<TaskListFilterDialog
  initialSettings={currentFilterSettings}
  bind:open={filterDialogOpen}
  onUpdateSettings={handleUpdateFilterSettings}
  onReset={handleResetFilterSettings}
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
