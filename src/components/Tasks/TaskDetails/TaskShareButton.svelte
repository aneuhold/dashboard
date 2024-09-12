<script lang="ts">
  import { goto } from '$app/navigation';
  import { taskSharingDialog } from '$components/singletons/dialogs/SingletonTaskSharingDialog/SingletonTaskSharingDialog.svelte';
  import type { DocumentStore } from '$services/DocumentMapStoreService';
  import { userSettings } from '$stores/userSettings/userSettings';
  import { DashboardTask } from '@aneuhold/core-ts-db-lib';
  import Button, { Icon } from '@smui/button';
  import TaskService from '../../../services/Task/TaskService';

  export let task: DocumentStore<DashboardTask>;

  $: sharingDisabled = $task.userId.toString() !== $userSettings.config.userId.toString();
  $: finalParentId = TaskService.findParentIdWithSameSharedWith($task);
  $: taskId = $task._id.toString();
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
