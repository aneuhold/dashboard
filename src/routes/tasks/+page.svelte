<!--
  @component
  
  A page for settings of the dashboard for the current user.
-->
<script lang="ts">
  import { DashboardTask } from '@aneuhold/core-ts-db-lib';
  import Fab, { Icon } from '@smui/fab';
  import PageTitle from 'components/PageTitle.svelte';
  import TaskRow from 'components/TaskRow.svelte';
  import TaskService from 'util/TaskService';
  import { userSettings } from '../../stores/userSettings';
  import { tasksPageInfo } from './pageInfo';

  const taskMap = TaskService.getStore();

  $: taskIds = Object.keys($taskMap);

  function addTask() {
    taskMap.addTask(new DashboardTask($userSettings.config.userId));
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

<Fab color="primary" on:click={addTask}>
  <Icon class="material-icons">favorite</Icon>
</Fab>

<style>
  .content {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
