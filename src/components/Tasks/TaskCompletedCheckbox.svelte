<script lang="ts">
  import Checkbox from '@smui/checkbox';
  import ConfirmationDialog from 'components/ConfirmationDialog.svelte';
  import { snackbar } from 'components/Snackbar.svelte';
  import { TaskMapService } from '../../services/Task/TaskMapService';
  import ClickableDiv from '../presentational/ClickableDiv.svelte';

  export let taskId: string;

  let dialogOpen = false;
  $: task = TaskMapService.getTaskStore(taskId);
  $: preventDefault =
    !$task.parentRecurringTaskInfo &&
    !$task.completed &&
    $task.recurrenceInfo &&
    $task.recurrenceInfo.recurrenceEffect === 'rollOnCompletion';

  function toggleCompleted() {
    if (preventDefault) {
      dialogOpen = true;
    } else {
      $task.completed = !$task.completed;
    }
  }

  function handleConfirm() {
    $task.completed = !$task.completed;
    dialogOpen = false;
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

<ConfirmationDialog
  title="Complete task?"
  message="Completing this task will cause it to update according to the recurrence info."
  bind:open={dialogOpen}
  on:confirm={handleConfirm}
/>
