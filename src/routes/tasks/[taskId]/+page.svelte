<!--
  @component
  
  A details page for a particular task for the user.


  ### Implementation notes:

  This will not be re-created for each task, but will instead be re-used, so
  the task needs to be dynamic.
-->
<script lang="ts">
  import { page } from '$app/stores';
  import type { DashboardTask } from '@aneuhold/core-ts-db-lib';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import Paper, { Content } from '@smui/paper';
  import BreadCrumb, { type BreadCrumbArray } from 'components/BreadCrumb.svelte';
  import InputBox from 'components/InputBox.svelte';
  import PageTitle from 'components/PageTitle.svelte';
  import TaskService from 'util/TaskService';

  let taskId = $page.params.taskId;
  $: taskId = $page.params.taskId;
  let taskMap = TaskService.getStore();
  $: task = $taskMap[taskId] ? TaskService.getTaskStore(taskId) : null;

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
    while (currentTask) {
      breadCrumbs.push({
        name: currentTask.title,
        link: `tasks/${currentTask._id.toString()}`
      });
      if (!currentTask.parentTaskId) {
        break;
      }
      currentTask = $taskMap[currentTask.parentTaskId.toString()];
    }
    return breadCrumbs;
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
</style>
