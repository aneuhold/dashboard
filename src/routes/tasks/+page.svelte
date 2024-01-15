<!--
  @component
  
  A page for main tasks for the current user.
-->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { DashboardTask } from '@aneuhold/core-ts-db-lib';
  import FabButton from 'components/FabButton.svelte';
  import PageTitle from 'components/PageTitle.svelte';
  import TaskDetails from 'components/Tasks/TaskDetails.svelte';
  import TaskList from 'components/Tasks/TaskList.svelte';
  import TaskService from 'util/Task/TaskService';
  import { userSettings } from '../../stores/userSettings';
  import { tasksPageInfo } from './pageInfo';

  const taskMap = TaskService.getStore();

  $: taskIds = Object.keys($taskMap).filter((taskId) => {
    const parentTaskId = $taskMap[taskId].parentTaskId;
    if (!parentTaskId) return true;
    // Conditional for shared subtasks
    if (!$taskMap[parentTaskId.toString()]) return true;
    return false;
  });
  $: taskId = $page.url.searchParams.get('taskId');

  function addTask() {
    const newTask = new DashboardTask($userSettings.config.userId);
    taskMap.addTask(newTask);
    goto(TaskService.getTaskRoute(newTask._id.toString()));
  }
</script>

<svelte:head>
  <title>{taskId && $taskMap[taskId] ? $taskMap[taskId].title : tasksPageInfo.shortTitle}</title>
  <meta name="description" content={tasksPageInfo.description} />
</svelte:head>

<div class="content">
  {#if taskId}
    <TaskDetails {taskId} />
  {:else}
    <PageTitle title={tasksPageInfo.shortTitle} subtitle={tasksPageInfo.description} />

    <TaskList {taskIds} />

    <FabButton clickHandler={addTask} iconName="add" />
  {/if}
</div>

<style>
  .content {
    /* Some extra margin to allow scrolling */
    margin-bottom: 80px;
  }
</style>
