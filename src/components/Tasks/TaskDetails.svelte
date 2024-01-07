<!--
  @component
  
  A details component for a particular task for the user.

  ### Implementation notes:

  This will not be re-created for each task, but will instead be re-used, so
  the task needs to be dynamic.
-->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { DashboardTask, getDashboardTaskChildrenIds } from '@aneuhold/core-ts-db-lib';
  import Button from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import Paper, { Content } from '@smui/paper';
  import BreadCrumb from 'components/BreadCrumb.svelte';
  import FabButton from 'components/FabButton.svelte';
  import InputBox from 'components/InputBox.svelte';
  import PageTitle from 'components/PageTitle.svelte';
  import TaskService from 'util/TaskService';
  import { userSettings } from '../../stores/userSettings';
  import ConfirmationDialog from '../ConfirmationDialog.svelte';
  import TaskList from './TaskList.svelte';

  export let taskId: string;

  let dialogOpen = false;
  let taskMap = TaskService.getStore();
  $: task = $taskMap[taskId] ? TaskService.getTaskStore(taskId) : null;
  $: subTaskIds = $task
    ? Object.values($taskMap)
        .filter((taskValue) => taskValue.parentTaskId?.toString() === taskId)
        .map((taskValue) => taskValue._id.toString())
    : [];
  $: allChildrenIds = $task
    ? getDashboardTaskChildrenIds(Object.values($taskMap), [$task._id])
    : [];
  // Explicitly include `task` so that it reactively updates
  $: breadCrumbArray = TaskService.getBreadCrumbArray($task ? $task._id.toString() : taskId);

  function addSubTask() {
    if (!$task) return;
    const newTask = new DashboardTask($userSettings.config.userId);
    newTask.parentTaskId = $task._id;
    taskMap.addTask(newTask);
    goto(TaskService.getTaskRoute(newTask._id.toString()));
  }

  function deleteTask() {
    if (!$task) return;
    const taskId = $task._id.toString();
    goto(TaskService.getTaskCategoryRoute(taskId)).then(() => {
      taskMap.deleteTask(taskId);
    });
  }

  function handleDeleteClick() {
    if (allChildrenIds.length > 0) {
      dialogOpen = true;
      return;
    }
    deleteTask();
  }
</script>

<div class="content">
  <BreadCrumb {breadCrumbArray} />
  {#if !$task}
    <PageTitle includeBreadcrumb={false} title="Task not found 🥺" />
  {:else}
    <Paper>
      <Content>
        <div class="content paperContent">
          <div class="titleContainer">
            <FormField>
              <Checkbox bind:checked={$task.completed} touch />
            </FormField>
            <InputBox variant="outlined" label="Title" bind:onBlurValue={$task.title} />
          </div>
          <InputBox label="Description" isTextArea={true} bind:onBlurValue={$task.description} />
          <div class="rightSide">
            <Button variant="raised" color="secondary" on:click={handleDeleteClick}>Delete</Button>
          </div>
        </div>
      </Content>
    </Paper>
    {#if subTaskIds.length !== 0}
      <div class="subTasksTitleContainer">
        <h3 class="mdc-typography--headline5 subTasksTitle">Sub Tasks</h3>
        {#if allChildrenIds.length > subTaskIds.length}
          <i class="mdc-typography--body1 subTasksTitle dimmed-color">
            {allChildrenIds.length} total child tasks
          </i>
        {/if}
      </div>
      <TaskList taskIds={subTaskIds} />
    {:else}
      <div class="mdc-typography--body1 subTasksTitle dimmed-color"><i>No sub tasks</i></div>
    {/if}
    <FabButton iconName="add" clickHandler={addSubTask} label="Add Subtask" />
  {/if}
</div>

<ConfirmationDialog
  title="Delete Task"
  message={`Are you sure you want to delete this task? It has ${allChildrenIds.length} sub tasks.`}
  bind:open={dialogOpen}
  on:confirm={deleteTask}
/>

<style>
  .titleContainer {
    display: grid;
    grid-template-columns: min-content 1fr;
  }
  .content {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 16px;
  }
  .paperContent {
    gap: 16px;
  }
  .subTasksTitleContainer {
    display: flex;
    flex-direction: column;
  }
  .subTasksTitle {
    margin: auto;
    margin-top: 0px;
    margin-bottom: 0px;
  }
  .rightSide {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
</style>
