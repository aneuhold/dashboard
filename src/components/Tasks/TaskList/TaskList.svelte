<!--
  @component
  
  A list of tasks.
-->
<script lang="ts">
  import {
    DashboardTaskService,
    DashboardTaskSortBy,
    getDefaultTaskListSortSettings
  } from '@aneuhold/core-ts-db-lib';
  import TaskRow from 'components/Tasks/TaskRow.svelte';
  import { flip } from 'svelte/animate';
  import { slide } from 'svelte/transition';
  import { TaskMapService } from '../../../services/Task/TaskMapService';
  import { currentUserId } from '../../../stores/derived/currentUserId';
  import { userSettings } from '../../../stores/userSettings';
  import TaskListOptions from './TaskListOptions.svelte';

  export let taskIds: string[];
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
        taskIds,
        $currentUserId,
        $userSettings.config.tagSettings,
        'No Priority'
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
  />
  {#each taskIds as taskId (taskId)}
    <div transition:slide animate:flip={{ duration: 200 }}>
      <TaskRow
        tagHeaderName={tagHeaderMap && tagHeaderMap[taskId] ? tagHeaderMap[taskId] : undefined}
        {taskId}
      />
    </div>
  {/each}
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
