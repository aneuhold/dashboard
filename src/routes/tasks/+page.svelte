<!--
  @component
  
  A page for settings of the dashboard for the current user.
-->
<script lang="ts">
  import PageTitle from 'components/PageTitle.svelte';
  import TaskRow from 'components/TaskRow.svelte';
  import TaskService from 'util/TaskService';
  import { tasksPageInfo } from './pageInfo';

  const taskMap = TaskService.getStore();

  $: taskIds = Object.keys($taskMap);
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

<style>
  .content {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
