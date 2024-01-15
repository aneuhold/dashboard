<script lang="ts">
  import { goto } from '$app/navigation';
  import Button, { Icon } from '@smui/button';
  import TaskService from 'util/Task/TaskService';
  import { userSettings } from '../../stores/userSettings';
  import TaskSharingDialog from './TaskSharingDialog.svelte';

  export let taskId: string;

  let sharingDialogOpen = false;
  $: task = TaskService.getTaskStore(taskId);
  $: sharingDisabled = $task?.userId.toString() !== $userSettings.config.userId.toString();
  $: finalParentId = TaskService.findParentIdWithSameSharedWith($task);
  $: buttonText = finalParentId === taskId || sharingDisabled ? 'Share' : 'Configure Sharing';

  function handleClick() {
    if (finalParentId === taskId) {
      sharingDialogOpen = true;
    } else {
      goto(TaskService.getTaskRoute(finalParentId, true));
    }
  }
</script>

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

<TaskSharingDialog {taskId} bind:open={sharingDialogOpen} />
