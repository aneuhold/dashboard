<script lang="ts">
  import { RecurrenceBasis } from '@aneuhold/core-ts-db-lib';
  import { DateService } from '@aneuhold/core-ts-lib';
  import ConfirmationDialog from 'components/ConfirmationDialog.svelte';
  import DatePickerDialog from 'components/DatePickerDialog.svelte';
  import TaskRecurrenceService from 'util/Task/TaskRecurrenceService';
  import TaskService from 'util/Task/TaskService';
  import TaskDateButton from './TaskDateButton.svelte';

  export let taskId: string;
  $: task = TaskService.getTaskStore(taskId);

  let currentlyChosenDateType: 'start' | 'due' = 'start';
  let datePickerOpen = false;
  let confirmationDialogOpen = false;
  let confirmationDialogTitle = '';
  let confirmationDialogMessage = '';
  let pendingDateUpdate: Date | undefined = undefined;
  $: dateName = currentlyChosenDateType === 'start' ? 'Start Date' : 'Due Date';
  $: currentlyChosenDate = currentlyChosenDateType === 'start' ? $task.startDate : $task.dueDate;
  $: oppositeDateName = currentlyChosenDateType === 'start' ? 'Due Date' : 'Start Date';
  $: basisIsSameAsChosenDate =
    currentlyChosenDateType === 'start'
      ? $task.recurrenceInfo?.recurrenceBasis === RecurrenceBasis.startDate
      : $task.recurrenceInfo?.recurrenceBasis === RecurrenceBasis.dueDate;

  function handleStartDateClick() {
    currentlyChosenDateType = 'start';
    datePickerOpen = true;
  }
  function handleDueDateClick() {
    currentlyChosenDateType = 'due';
    datePickerOpen = true;
  }

  function handleSelectedDate(event: CustomEvent<Date | null>) {
    pendingDateUpdate = event.detail ? event.detail : undefined;
    datePickerOpen = false;
    if (!DateService.datesAreEqual(currentlyChosenDate, pendingDateUpdate)) {
      if (!pendingDateUpdate) {
        handleDateDeletion();
      } else {
        handleDateUpdate(pendingDateUpdate);
      }
    }
  }

  function handleDateDeletion() {
    if (!$task.parentRecurringTaskInfo && basisIsSameAsChosenDate) {
      if (currentlyChosenDate) {
        confirmationDialogTitle = `Update ${dateName} to before recurrence date?`;
        confirmationDialogMessage =
          `This task is recurring and the basis is currently set to the ${dateName}. ` +
          `Would you like to switch the basis to the ${oppositeDateName}?`;
        confirmationDialogOpen = true;
        return;
      } else {
        confirmationDialogTitle = 'Disable recurring on this task?';
        confirmationDialogMessage = `This task is currently recurring, the basis is set to ${dateName} and there isn't a ${oppositeDateName} to switch to. Do you want to disable recurring on this task?`;
        confirmationDialogOpen = true;
        return;
      }
    }
    if (currentlyChosenDateType === 'start') {
      $task.startDate = undefined;
    } else {
      $task.dueDate = undefined;
    }
  }

  function handleDateUpdate(newDate: Date) {
    if (!$task.parentRecurringTaskInfo && basisIsSameAsChosenDate) {
      // Simulate moving the date
      const simulatedRecurrenceDate = TaskRecurrenceService.getSimulatedRecurrenceDate(
        $task,
        (task) => {
          if (currentlyChosenDateType === 'start') {
            task.startDate = newDate;
          } else {
            task.dueDate = newDate;
          }
          return task;
        }
      );
      if (simulatedRecurrenceDate && simulatedRecurrenceDate < new Date()) {
        confirmationDialogTitle = `Update ${dateName} to before recurrence date?`;
        confirmationDialogMessage =
          `This task is recurring and the basis is currently set to the ${dateName}. ` +
          `Updating the ${dateName} to ${DateService.getAutoDateString(newDate)} will ` +
          ` cause the recurrence date to be ${DateService.getDateTimeString(
            simulatedRecurrenceDate
          )} which is before right now. ` +
          `This will cause the task to be updated as if the recurrence has triggered. ` +
          `Are you sure you want to do this?`;
        confirmationDialogOpen = true;
        return;
      }
    }
    if (currentlyChosenDateType === 'start') {
      $task.startDate = newDate;
    } else {
      $task.dueDate = newDate;
    }
  }

  /**
   * Handles the situation where Confirm was pressed in the confirmation dialog.
   *
   * This should only happen in the edge cases where a start or due date is
   * being deleted and there is a recurring task with a recurrence basis that
   * matches the date being deleted. Or, there is a start or due date being
   * updated to a date before the next recurrence date.
   *
   * This could probably be refactored a bit.
   */
  function handleDialogConfirm() {
    if (pendingDateUpdate) {
      if (currentlyChosenDateType === 'start') {
        $task.startDate = pendingDateUpdate;
      } else {
        $task.dueDate = pendingDateUpdate;
      }
      return;
    }
    // If the task is a recurring task, and the basis is the start date
    if (currentlyChosenDateType === 'start') {
      if ($task.dueDate) {
        task.update((task) => {
          task.startDate = undefined;
          if (task.recurrenceInfo) {
            task.recurrenceInfo.recurrenceBasis = RecurrenceBasis.dueDate;
          } else {
            console.error(
              'Task had no recurrence info while trying to update recurrence basis to due date!'
            );
          }
          return task;
        });
      } else {
        task.update((task) => {
          task.startDate = undefined;
          task.recurrenceInfo = undefined;
          return task;
        });
      }
      // If the task is a recurring task, and the basis is the due date
    } else {
      if ($task.startDate) {
        task.update((task) => {
          task.dueDate = undefined;
          if (task.recurrenceInfo) {
            task.recurrenceInfo.recurrenceBasis = RecurrenceBasis.startDate;
          } else {
            console.error(
              'Task had no recurrence info while trying to update recurrence basis to start date!'
            );
          }
          return task;
        });
      } else {
        task.update((task) => {
          task.dueDate = undefined;
          task.recurrenceInfo = undefined;
          return task;
        });
      }
    }
  }

  function handleDialogCancel() {
    confirmationDialogOpen = false;
  }
</script>

<div class="container">
  <TaskDateButton dateType="start" on:click={handleStartDateClick} date={$task.startDate} />
  <TaskDateButton dateType="due" on:click={handleDueDateClick} date={$task.dueDate} />
</div>

<DatePickerDialog
  bind:open={datePickerOpen}
  title={dateName}
  startDate={currentlyChosenDateType === 'due' ? $task.startDate : undefined}
  endDate={currentlyChosenDateType === 'start' ? $task.dueDate : undefined}
  dateIsEndDate={currentlyChosenDateType === 'due'}
  on:selected={handleSelectedDate}
  initialDate={currentlyChosenDate}
/>

<ConfirmationDialog
  bind:open={confirmationDialogOpen}
  title={confirmationDialogTitle}
  message={confirmationDialogMessage}
  on:cancel={handleDialogCancel}
  on:confirm={handleDialogConfirm}
/>

<style>
  .container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
  }
</style>
