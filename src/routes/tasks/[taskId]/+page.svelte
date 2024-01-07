<!--
  @component
  
  A details page for a particular task for the user.


  ### Implementation notes:

  This will not be re-created for each task, but will instead be re-used, so
  the task needs to be dynamic.
-->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { DashboardTask } from '@aneuhold/core-ts-db-lib';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import Paper, { Content } from '@smui/paper';
  import BreadCrumb, { type BreadCrumbArray } from 'components/BreadCrumb.svelte';
  import FabButton from 'components/FabButton.svelte';
  import InputBox from 'components/InputBox.svelte';
  import PageTitle from 'components/PageTitle.svelte';
  import TaskRow from 'components/TaskRow.svelte';
  import TaskService from 'util/TaskService';
  import { userSettings } from '../../../stores/userSettings';

  let taskId = $page.params.taskId;
  $: taskId = $page.params.taskId;
  let taskMap = TaskService.getStore();
  $: taskMap = TaskService.getStore();
  let task = $taskMap[taskId] ? TaskService.getTaskStore(taskId) : null;
  $: task = $taskMap[taskId] ? TaskService.getTaskStore(taskId) : null;
  $: subTasks = $taskMap[taskId]
    ? Object.values($taskMap).filter((task) => task.parentTaskId?.toString() === taskId)
    : [];

  $: breadCrumbArray = getBreadCrumbArray($task);

  function getBreadCrumbArray(task: DashboardTask | null): BreadCrumbArray {
    const breadCrumbs: BreadCrumbArray = [];
    if (!task)
      return [
        { name: 'tasks', link: 'tasks' },
        { name: $task?.title ?? 'Task not found', link: `link not needed` }
      ];
    // Change this in the future when there are multiple places for tasks.
    if (task.category === 'default') {
      breadCrumbs.push({ name: 'tasks', link: 'tasks' });
    }
    let currentTask = task;
    let parentTaskChain: BreadCrumbArray = [];
    while (currentTask) {
      parentTaskChain.unshift({
        name: currentTask.title,
        link: `tasks/${currentTask._id.toString()}`
      });
      if (!currentTask.parentTaskId) {
        break;
      }
      currentTask = $taskMap[currentTask.parentTaskId.toString()];
    }
    breadCrumbs.push(...parentTaskChain);
    return breadCrumbs;
  }

  function addSubTask() {
    if (!$task) return;
    const newTask = new DashboardTask($userSettings.config.userId);
    newTask.parentTaskId = $task._id;
    taskMap.addTask(newTask);
    goto(`/tasks/${newTask._id.toString()}`);
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
          <InputBox
            label="Description"
            inputType="textarea"
            isTextArea={true}
            bind:onBlurValue={$task.description}
          />
        </div>
      </Content>
    </Paper>
    <h3 class="mdc-typography--headline5 subTasksTitle">Sub Tasks</h3>
    {#if subTasks.length === 0}
      <div class="mdc-typography--body1 subTasksTitle dimmed-color"><i>No sub tasks</i></div>
    {/if}
    {#each subTasks as subTask}
      <TaskRow taskId={subTask._id.toString()} />
    {/each}
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
  .paperContent {
    gap: 16px;
  }
  .subTasksTitle {
    margin: auto;
    margin-top: 0px;
    margin-bottom: 0px;
  }
</style>
