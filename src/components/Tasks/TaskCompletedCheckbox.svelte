<script lang="ts">
  import { triggerConfetti } from '$components/singletons/Confetti/Confetti.svelte';
  import { snackbar } from '$components/singletons/SingletonSnackbar.svelte';
  import { confirmationDialog } from '$components/singletons/dialogs/SingletonConfirmationDialog.svelte';
  import { RecurrenceEffect } from '@aneuhold/core-ts-db-lib';
  import Checkbox from '@smui/checkbox';
  import { TaskMapService } from '../../services/Task/TaskMapService/TaskMapService';
  import ClickableDiv, { type ClickEvent } from '../presentational/ClickableDiv.svelte';

  interface Props {
    taskId: string;
  }

  let { taskId }: Props = $props();

  // X and Y of the most recent click event for use in confetti
  let clickX = 0;
  let clickY = 0;

  let task = $derived(TaskMapService.getTaskStore(taskId));
  let preventDefault =
    $derived(!$task.parentRecurringTaskInfo &&
    !$task.completed &&
    $task.recurrenceInfo &&
    $task.recurrenceInfo.recurrenceEffect === RecurrenceEffect.rollOnCompletion);

  function handleCheckboxClick(event?: ClickEvent) {
    if (event) {
      clickX = event.clientX;
      clickY = event.clientY;
    }
    if (preventDefault) {
      confirmationDialog.open({
        title: 'Complete task?',
        message: 'Completing this task will cause it to update according to the recurrence info.',
        onConfirm: handleConfirm
      });
    } else {
      handleToggle();
    }
  }

  function handleConfirm() {
    handleToggle();
    snackbar.success('Task completed then updated 🎉');
  }

  function handleToggle() {
    if (!$task.completed) {
      triggerConfetti(clickX, clickY);
    }
    $task.completed = !$task.completed;
  }
</script>

<ClickableDiv clickAction={handleCheckboxClick}>
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
