<script lang="ts">
  import { snackbar } from '$components/singletons/SingletonSnackbar.svelte';
  import { confirmationDialog } from '$components/singletons/dialogs/SingletonConfirmationDialog.svelte';
  import Checkbox from '@smui/checkbox';
  import { TaskMapService } from '../../services/Task/TaskMapService';
  import ClickableDiv from '../presentational/ClickableDiv.svelte';

  export let taskId: string;

  $: task = TaskMapService.getTaskStore(taskId);
  $: preventDefault =
    !$task.parentRecurringTaskInfo &&
    !$task.completed &&
    $task.recurrenceInfo &&
    $task.recurrenceInfo.recurrenceEffect === 'rollOnCompletion';

  function toggleCompleted() {
    if (preventDefault) {
      confirmationDialog.open({
        title: 'Complete task?',
        message: 'Completing this task will cause it to update according to the recurrence info.',
        onConfirm: handleConfirm
      });
    } else {
      $task.completed = !$task.completed;
    }
  }

  function handleConfirm() {
    $task.completed = !$task.completed;
    snackbar.success('Task completed then updated 🎉');
  }
</script>

<ClickableDiv clickAction={toggleCompleted}>
  <Checkbox
    checked={$task.completed}
    touch
    on:click={(event) => {
      if (preventDefault) {
        event.preventDefault();
      }
    }}
  />
</ClickableDiv>
