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

  let currentTimeout: NodeJS.Timeout | undefined = undefined;

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
      if (!$task.completed) {
        showConfetti = true;
        // Use a timeout so that it will have a little bit to show the animation.
        if (currentTimeout) clearTimeout(currentTimeout);
        currentTimeout = setTimeout(() => {
          $task.completed = !$task.completed;
        }, 1200);
        return;
      } else {
        showConfetti = false;
      }
    }
    $task.completed = !$task.completed;
  }
</script>

<ClickableDiv clickAction={handleCheckboxClick}>
  <Confetti bind:show={showConfetti} />
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
