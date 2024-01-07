<!--
  @component
  
  A page for main tasks for the current user.
-->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { DashboardTask } from '@aneuhold/core-ts-db-lib';
  import FabButton from 'components/FabButton.svelte';
  import PageTitle from 'components/PageTitle.svelte';
  import TaskRow from 'components/TaskRow.svelte';
  import TaskService from 'util/TaskService';
  import { userSettings } from '../../stores/userSettings';
  import { tasksPageInfo } from './pageInfo';

  const taskMap = TaskService.getStore();

  $: taskIds = Object.keys($taskMap).filter((taskId) => !$taskMap[taskId].parentTaskId);

  function addTask() {
    const newTask = new DashboardTask($userSettings.config.userId);
    taskMap.addTask(newTask);
    goto(`/tasks/${newTask._id.toString()}`);
  }
</script>

<svelte:head>
  <title>{tasksPageInfo.shortTitle}</title>
  <meta name="description" content={tasksPageInfo.description} />
</svelte:head>

<PageTitle title={tasksPageInfo.shortTitle} subtitle={tasksPageInfo.description} />

<div class="content">
  {#each taskIds as taskId}
    <TaskRow {taskId} />
  {/each}
</div>

<FabButton clickHandler={addTask} iconName="add" />

<style>
  .content {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
