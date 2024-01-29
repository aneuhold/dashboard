<!--
  @component
  
  A details component for a particular task for the user.

  ### Implementation notes:

  This will not be re-created for each task, but will instead be re-used, so
  the task needs to be dynamic.
-->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { DashboardTask, DashboardTaskService } from '@aneuhold/core-ts-db-lib';
  import Button, { Icon } from '@smui/button';
  import Paper, { Content } from '@smui/paper';
  import BreadCrumb from 'components/BreadCrumb.svelte';
  import PageTitle from 'components/PageTitle.svelte';
  import FabButton from 'components/presentational/FabButton.svelte';
  import InputBox from 'components/presentational/InputBox.svelte';
  import TaskListService from '../../services/Task/TaskListService';
  import { TaskMapService } from '../../services/Task/TaskMapService';
  import TaskService from '../../services/Task/TaskService';
  import { userSettings } from '../../stores/userSettings';
  import TaskCompletedCheckbox from './TaskCompletedCheckbox.svelte';
  import TaskDateInfo from './TaskDate/TaskDateInfo.svelte';
  import TaskList from './TaskList/TaskList.svelte';
  import TaskRecurrenceInfo from './TaskRecurrence/TaskRecurrenceInfo.svelte';
  import TaskShareButton from './TaskShareButton.svelte';
  import TaskSharingInfo from './TaskSharingInfo.svelte';
  import TaskTagsSelector from './TaskTags/TaskTagsSelector.svelte';

  export let taskId: string;

  let taskMap = TaskMapService.getStore();
  $: task = $taskMap[taskId] ? TaskMapService.getTaskStore(taskId) : undefined;
  $: allChildrenIds = $task
    ? DashboardTaskService.getChildrenIds(Object.values($taskMap), [$task._id]).map((id) =>
        id.toString()
      )
    : [];
  $: sortAndFilterResult = TaskListService.getTaskIdsForTask(
    $taskMap,
    $userSettings,
    allChildrenIds,
    $task
  );
  // Explicitly include `task` so that it reactively updates
  $: breadCrumbArray = TaskService.getBreadCrumbArray($task ? $task._id.toString() : taskId);
  $: parentTaskId = $task ? $task.parentTaskId : undefined;
  $: parentRoute = parentTaskId
    ? TaskService.getTaskRoute(parentTaskId.toString())
    : TaskService.getTaskCategoryRoute(taskId);

  function addSubTask() {
    if (!$task) return;
    const newTask = new DashboardTask($task.userId);
    newTask.title = 'New Task';
    newTask.parentTaskId = $task._id;
    newTask.sharedWith = $task.sharedWith;
    newTask.recurrenceInfo = $task.recurrenceInfo;
    newTask.parentRecurringTaskInfo = $task.recurrenceInfo
      ? {
          taskId: $task._id,
          startDate: $task.startDate,
          dueDate: $task.dueDate
        }
      : undefined;
    taskMap.addDoc(newTask);
    goto(TaskService.getTaskRoute(newTask._id.toString()));
  }

  function deleteTask() {
    if (!$task) return;
    // Purposefully set the task ID, and don't use the one from the component
    // otherwise the parent will be deleted.
    const taskIdToDelete = $task._id.toString();
    goto(parentRoute).then(() => {
      taskMap.deleteDoc(taskIdToDelete);
    });
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
            <TaskCompletedCheckbox {taskId} />
            <InputBox variant="outlined" label="Title" bind:onBlurValue={$task.title} />
          </div>
          <InputBox label="Description" isTextArea={true} bind:onBlurValue={$task.description} />
          <TaskDateInfo {taskId} />
          <TaskRecurrenceInfo {taskId} childTaskIds={allChildrenIds} />
          <div class="extraTaskInfo">
            <TaskTagsSelector {taskId} />
            <TaskSharingInfo {taskId} />
          </div>
          <div class="taskButtons">
            <TaskShareButton {taskId} />
            <Button
              variant="outlined"
              class="danger-button"
              on:click={() =>
                TaskService.handleDeleteTaskClick(allChildrenIds.length, deleteTask, $task?.title)}
            >
              <Icon class="material-icons">delete</Icon>
              Delete
            </Button>
          </div>
          <div class="doneButton">
            <Button
              on:click={() => goto(parentRoute)}
              style="width: 100%; max-width: 500px"
              variant="outlined"
              class="primary-button"
            >
              Done
            </Button>
          </div>
        </div>
      </Content>
    </Paper>
    {#if sortAndFilterResult.filteredAndSortedIds.length !== 0}
      <div class="subTasksTitleContainer">
        <h3 class="mdc-typography--headline5 subTasksTitle">Sub Tasks</h3>
        {#if allChildrenIds.length > sortAndFilterResult.filteredAndSortedIds.length}
          <i class="mdc-typography--body1 subTasksTitle dimmed-color">
            {allChildrenIds.length} total child tasks
          </i>
        {/if}
      </div>
      <TaskList category={$task.category} parentTaskId={taskId} {sortAndFilterResult} />
    {:else}
      <div class="mdc-typography--body1 subTasksTitle dimmed-color"><i>No sub tasks</i></div>
    {/if}
    <FabButton iconName="add" clickHandler={addSubTask} label="Add Subtask" />
  {/if}
</div>

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
  .extraTaskInfo {
    display: flex;
    flex-direction: row;
    gap: 16px;
    justify-content: space-between;
    flex-wrap: wrap;
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
  .taskButtons {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: space-between;
  }
  .doneButton {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
