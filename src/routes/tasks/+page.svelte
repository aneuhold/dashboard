<!--
  @component
  
  A page for main tasks for the current user.
-->
<script lang="ts">
  import { DashboardTask } from '@aneuhold/core-ts-db-lib';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import PageTitle from '$components/PageTitle.svelte';
  import { FabButton } from '$components/presentational';
  import TaskDetails from '$components/Tasks/TaskDetails/TaskDetails.svelte';
  import TaskList from '$components/Tasks/TaskList/TaskList.svelte';
  import { userSettings } from '$stores/userSettings/userSettings';
  import TaskListService from '../../services/Task/TaskListService';
  import { TaskMapService } from '../../services/Task/TaskMapService/TaskMapService';
  import TaskService from '../../services/Task/TaskService';
  import { tasksPageInfo } from './pageInfo';

  const taskMap = TaskMapService.getStore();

  let sortAndFilterResult = $derived(
    TaskListService.getTaskIds($taskMap, $userSettings, 'default')
  );
  let taskId = $derived($page.url.searchParams.get('taskId'));
  let task = $derived(taskId && $taskMap[taskId] ? $taskMap[taskId] : undefined);

  function addTask() {
    const newTask = new DashboardTask($userSettings.config.userId);
    taskMap.addDoc(newTask);
    goto(TaskService.getTaskRoute(newTask._id.toString()));
  }
</script>

<svelte:head>
  <title>{task ? task.title : tasksPageInfo.shortTitle}</title>
  <meta name="description" content={tasksPageInfo.description} />
</svelte:head>

<div class="content">
  {#if taskId}
    <TaskDetails {taskId} />
  {:else}
    <PageTitle title={tasksPageInfo.shortTitle} subtitle={tasksPageInfo.description} />

    <TaskList category="default" {sortAndFilterResult} />

    <FabButton clickHandler={addTask} iconName="add" />
  {/if}
</div>

<style>
  .content {
    /* Some extra margin to allow scrolling */
    margin-bottom: 80px;
  }
</style>
