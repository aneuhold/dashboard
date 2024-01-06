<!--
  @component
  
  A details page for a particular task for the user.


  ### Implementation notes:

  This will not be re-created for each task, but will instead be re-used, so
  the task needs to be dynamic.
-->
<script lang="ts">
  import { page } from '$app/stores';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import Paper, { Content } from '@smui/paper';
  import InputBox from 'components/InputBox.svelte';
  import PageTitle from 'components/PageTitle.svelte';
  import TaskService from 'util/TaskService';

  let taskId = $page.params.taskId;
  $: taskId = $page.params.taskId;
  let taskMap = TaskService.getStore();
  $: task = $taskMap[taskId] ? TaskService.getTaskStore(taskId) : null;

  let someText = 'Hello world!';
</script>

<div class="content">
  {#if !$task}
    <PageTitle title="Task not found 🥺" />
  {:else}
    <PageTitle title={$task.title} />
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
  }
  .paperContent {
    gap: 16px;
  }
</style>
