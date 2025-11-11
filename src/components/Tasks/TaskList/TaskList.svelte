<!--
  @component
  
  A list of tasks.
-->
<script lang="ts">
  import type { DashboardTaskFilterAndSortResult } from '@aneuhold/core-ts-db-lib';
  import {
    DashboardTaskService,
    DashboardTaskSortBy,
    getDefaultTaskListSortSettings
  } from '@aneuhold/core-ts-db-lib';
  import { flip } from 'svelte/animate';
  import { slide } from 'svelte/transition';
  import TaskRow from '$components/Tasks/TaskList/TaskRow.svelte';
  import { TaskMapService } from '$services/Task/TaskMapService/TaskMapService';
  import { currentUserId } from '$stores/derived/currentUserId';
  import { userSettings } from '$stores/userSettings/userSettings';
  import TaskListOptions from './TaskListOptions.svelte';

  let {
    sortAndFilterResult,
    category,
    parentTaskId = undefined
  }: {
    sortAndFilterResult: DashboardTaskFilterAndSortResult;
    category: string;
    parentTaskId?: string | undefined;
  } = $props();

  const taskMap = TaskMapService.getStore();
  let parentTask = $derived(parentTaskId ? TaskMapService.getTaskStore(parentTaskId) : undefined);
  let parentTaskSortSettings = $derived(
    $parentTask ? $parentTask.sortSettings[$currentUserId] : undefined
  );
  let userTaskSortSettings = $derived($userSettings.config.taskListSortSettings[category]);
  let currentSortSettings = $derived(
    parentTaskSortSettings ?? userTaskSortSettings ?? getDefaultTaskListSortSettings($currentUserId)
  );
  let isSortedByTagsFirst = $derived(
    currentSortSettings.sortList.length !== 0 &&
      currentSortSettings.sortList[0].sortBy === DashboardTaskSortBy.tags
  );
  let tagHeaderMap = $derived(
    isSortedByTagsFirst
      ? DashboardTaskService.getTagHeaderMap(
          $taskMap,
          sortAndFilterResult.filteredAndSortedIds,
          $currentUserId,
          $userSettings.config.tagSettings,
          'No Priority',
          currentSortSettings.sortList[0].sortDirection
        )
      : undefined
  );
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
