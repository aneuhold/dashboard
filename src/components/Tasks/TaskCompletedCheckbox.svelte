<script lang="ts">
  import Confetti from '$components/presentational/Confetti.svelte';
  import { snackbar } from '$components/singletons/SingletonSnackbar.svelte';
  import { confirmationDialog } from '$components/singletons/dialogs/SingletonConfirmationDialog.svelte';
  import Checkbox from '@smui/checkbox';
  import { TaskMapService } from '../../services/Task/TaskMapService';
  import { userSettings } from '../../stores/userSettings';
  import ClickableDiv from '../presentational/ClickableDiv.svelte';

  export let taskId: string;

  let showConfetti = false;

  $: task = TaskMapService.getTaskStore(taskId);
  $: preventDefault =
    !$task.parentRecurringTaskInfo &&
    !$task.completed &&
    $task.recurrenceInfo &&
    $task.recurrenceInfo.recurrenceEffect === 'rollOnCompletion';

  function handleCheckboxClick() {
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
    if ($userSettings.config.enabledFeatures.useConfettiForTasks) {
      if (!$task.completed && preventDefault) {
        // If the task will roll on completion, then show the confetti and
        // toggle right away, because it won't show checked anyway.
        showConfetti = true;
        toggleCompleted();
      } else if (!$task.completed) {
        showConfetti = true;
      } else {
        showConfetti = false;
        toggleCompleted();
      }
    } else {
      toggleCompleted();
    }
  }

  function toggleCompleted() {
    $task.completed = !$task.completed;
  }

  /**
   * Only toggles the completed state if the task is not already completed and
   * preventDefault isn't set. If it didn't check for preventDefault, it would
   * trigger recurrence twice.
   */
  function handleConfettiComplete() {
    if (!$task.completed && !preventDefault) {
      toggleCompleted();
    }
  }
</script>

<ClickableDiv clickAction={handleCheckboxClick}>
  <Confetti
    durationMs={1500}
    bind:show={showConfetti}
    on:confettiComplete={handleConfettiComplete}
  />
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
