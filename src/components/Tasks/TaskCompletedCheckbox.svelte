<script lang="ts">
  import { snackbar } from '$components/singletons/SingletonSnackbar.svelte';
  import { confirmationDialog } from '$components/singletons/dialogs/SingletonConfirmationDialog.svelte';
  import Checkbox from '@smui/checkbox';
  import { ConfettiExplosion } from 'svelte-confetti-explosion';
  import { TaskMapService } from '../../services/Task/TaskMapService';
  import { userSettings } from '../../stores/userSettings';
  import ClickableDiv from '../presentational/ClickableDiv.svelte';

  export let taskId: string;

  let confettiIsVisible = false;

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
      if ($task.completed && $userSettings.config.enabledFeatures.useConfettiForTasks) {
        confettiIsVisible = true;
        setTimeout(() => {
          confettiIsVisible = false;
        }, 3000);
      }
    }
  }

  function handleConfirm() {
    $task.completed = !$task.completed;
    snackbar.success('Task completed then updated 🎉');
  }
</script>

<ClickableDiv clickAction={toggleCompleted}>
  {#if confettiIsVisible}
    <ConfettiExplosion />
  {/if}
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
