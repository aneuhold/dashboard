<script lang="ts">
  import { goto } from '$app/navigation';
  import Button, { Icon } from '@smui/button';
  import { taskSharingDialog } from 'components/singletons/dialogs/SingletonTaskSharingDialog.svelte';
  import { TaskMapService } from '../../services/Task/TaskMapService';
  import TaskService from '../../services/Task/TaskService';
  import { userSettings } from '../../stores/userSettings';

  export let taskId: string;

  $: task = TaskMapService.getTaskStore(taskId);
  $: sharingDisabled = $task?.userId.toString() !== $userSettings.config.userId.toString();
  $: finalParentId = TaskService.findParentIdWithSameSharedWith($task);
  $: buttonText = finalParentId === taskId || sharingDisabled ? 'Share' : 'Configure Sharing';

  function handleClick() {
    if (finalParentId === taskId) {
      taskSharingDialog.open(taskId);
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
