<!--
  @component
  
  A list of tasks.
-->
<script lang="ts">
  import TaskRow from '$components/Tasks/TaskRow.svelte';
  import { TaskMapService } from '$services/Task/TaskMapService';
  import { currentUserId } from '$stores/derived/currentUserId';
  import { userSettings } from '$stores/userSettings';
  import {
    DashboardTaskService,
    DashboardTaskSortBy,
    getDefaultTaskListSortSettings
  } from '@aneuhold/core-ts-db-lib';
  import type { DashboardTaskFilterAndSortResult } from '@aneuhold/core-ts-db-lib/lib/services/dashboard/Task/TaskService';
  import { flip } from 'svelte/animate';
  import { slide } from 'svelte/transition';
  import TaskListOptions from './TaskListOptions.svelte';

  export let sortAndFilterResult: DashboardTaskFilterAndSortResult;
  export let category: string;
  export let parentTaskId: string | undefined = undefined;

  const taskMap = TaskMapService.getStore();
  $: parentTask = parentTaskId ? TaskMapService.getTaskStore(parentTaskId) : undefined;
  $: parentTaskSortSettings = $parentTask ? $parentTask.sortSettings[$currentUserId] : undefined;
  $: userTaskSortSettings = $userSettings.config.taskListSortSettings[category];
  $: currentSortSettings =
    parentTaskSortSettings ??
    userTaskSortSettings ??
    getDefaultTaskListSortSettings($currentUserId);
  $: isSortedByTagsFirst =
    currentSortSettings.sortList.length !== 0 &&
    currentSortSettings.sortList[0].sortBy === DashboardTaskSortBy.tags;
  $: tagHeaderMap = isSortedByTagsFirst
    ? DashboardTaskService.getTagHeaderMap(
        $taskMap,
        sortAndFilterResult.filteredAndSortedIds,
        $currentUserId,
        $userSettings.config.tagSettings,
        'No Priority',
        currentSortSettings.sortList[0].sortDirection
      )
    : undefined;
</script>

<div class="content">
  <TaskListOptions
    {category}
    {parentTask}
    {currentSortSettings}
    {userTaskSortSettings}
    {parentTaskSortSettings}
    removedTaskIds={sortAndFilterResult.removedIds}
  />
  {#each sortAndFilterResult.filteredAndSortedIds as taskId (taskId)}
    <div transition:slide animate:flip={{ duration: 200 }}>
      <TaskRow
        tagHeaderName={tagHeaderMap && tagHeaderMap[taskId] ? tagHeaderMap[taskId] : undefined}
        {taskId}
      />
    </div>
  {/each}
  {#if sortAndFilterResult.removedIds.length > 0}
    <div class="removedTasksText">
      <i class=" dimmed-color">
        {sortAndFilterResult.removedIds.length} Task{sortAndFilterResult.removedIds.length > 1
          ? 's'
          : ''} Hidden due to Filters
      </i>
    </div>
  {/if}
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .removedTasksText {
    display: flex;
    justify-content: center;
    margin-top: 8px;
  }
</style>
