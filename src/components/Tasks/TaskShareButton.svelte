<script lang="ts">
  import { goto } from '$app/navigation';
  import Button, { Icon } from '@smui/button';
  import Tooltip, { Wrapper } from '@smui/tooltip';
  import TaskService from 'util/TaskService';
  import { userSettings } from '../../stores/userSettings';
  import TaskSharingDialog from './TaskSharingDialog.svelte';

  export let taskId: string;

  let sharingDialogOpen = false;
  $: task = TaskService.getTaskStore(taskId);
  $: sharingDisabled = $task?.userId.toString() !== $userSettings.config.userId.toString();
  $: finalParentId = TaskService.findParentIdWithSameSharedWith($task);
  $: buttonText = finalParentId === taskId ? 'Share' : 'Configure Sharing';

  function handleClick() {
    if (finalParentId === taskId) {
      sharingDialogOpen = true;
    } else {
      goto(TaskService.getTaskRoute(finalParentId, true));
    }
  }
</script>

<Wrapper>
  <!--Extra div is needed for tooltip to show up when disabled-->
  <div>
    <Button
      variant="raised"
      class="secondary-button"
      color="secondary"
      disabled={sharingDisabled}
      on:click={handleClick}
    >
      <Icon class="material-icons">share</Icon>
      {buttonText}
    </Button>
  </div>
  {#if sharingDisabled}
    <Tooltip>Cannot share tasks you do not own</Tooltip>
  {/if}
</Wrapper>

<TaskSharingDialog {taskId} bind:open={sharingDialogOpen} />
