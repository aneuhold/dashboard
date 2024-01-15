<script lang="ts">
  import { RecurrenceBasis } from '@aneuhold/core-ts-db-lib';
  import { DateService } from '@aneuhold/core-ts-lib';
  import ConfirmationDialog from 'components/ConfirmationDialog.svelte';
  import DatePickerDialog from 'components/DatePickerDialog.svelte';
  import TaskService from 'util/TaskService';
  import TaskDateButton from './TaskDateButton.svelte';

  export let taskId: string;
  $: task = TaskService.getTaskStore(taskId);

  let taskMap = TaskService.getStore();
  let currentlyChosenDateType: 'start' | 'due' = 'start';
  let datePickerOpen = false;
  let confirmationDialogOpen = false;
  let confirmationDialogTitle = '';
  let confirmationDialogMessage = '';
  $: dialogTitle = currentlyChosenDateType === 'start' ? 'Start Date' : 'Due Date';
  $: currentlyChosenDate = currentlyChosenDateType === 'start' ? $task.startDate : $task.dueDate;

  function handleStartDateClick() {
    currentlyChosenDateType = 'start';
    datePickerOpen = true;
  }
  function handleDueDateClick() {
    currentlyChosenDateType = 'due';
    datePickerOpen = true;
  }

  function handleSelectedDate(event: CustomEvent<Date | null>) {
    const newDate = event.detail ? event.detail : undefined;
    datePickerOpen = false;
    if (
      currentlyChosenDateType === 'start' &&
      !DateService.datesAreEqual($task.startDate, newDate)
    ) {
      if (!newDate) {
        handleStartDateDeletion();
        return;
      }
      $task.startDate = newDate;
    } else if (
      currentlyChosenDateType === 'due' &&
      !DateService.datesAreEqual($task.dueDate, newDate)
    ) {
      if (!newDate) {
        handleDueDateDeletion();
        return;
      }
      $task.dueDate = newDate;
    }
  }

  function handleStartDateDeletion() {
    // If the task is a recurring task, and the basis is the start date
    if (
      !$task.parentRecurringTaskInfo &&
      $task.recurrenceInfo?.recurrenceBasis === RecurrenceBasis.startDate
    ) {
      // If the task has a due date, the basis can be switched to the due date.
      if ($task.dueDate) {
        confirmationDialogTitle = 'Update recurrence basis to Due Date?';
        confirmationDialogMessage =
          'This task is recurring and the basis is currently set to the Start Date. Would you like to switch the basis to the Due Date?';
      } else {
        confirmationDialogTitle = 'Disable recurring on this task?';
        confirmationDialogMessage = `This task is currently recurring, the basis is set to Start Date and there isn't a Due Date to switch to. Do you want to disable recurring on this task?`;
      }
      confirmationDialogOpen = true;
    } else {
      $task.startDate = undefined;
    }
  }

  function handleDueDateDeletion() {
    // If the task is a recurring task, and the basis is the due date
    if (
      !$task.parentRecurringTaskInfo &&
      $task.recurrenceInfo?.recurrenceBasis === RecurrenceBasis.dueDate
    ) {
      // If the task has a start date, the basis can be switched to the start date.
      if ($task.startDate) {
        confirmationDialogTitle = 'Update recurrence basis to Start Date?';
        confirmationDialogMessage =
          'This task is recurring and the basis is currently set to the Due Date. Would you like to switch the basis to the Start Date?';
      } else {
        confirmationDialogTitle = 'Disable recurring on this task?';
        confirmationDialogMessage = `This task is currently recurring, the basis is set to Due Date and there isn't a Start Date to switch to. Do you want to disable recurring on this task?`;
      }
      confirmationDialogOpen = true;
    } else {
      $task.dueDate = undefined;
    }
  }

  /**
   * Handles the situation where Confirm was pressed in the confirmation dialog.
   *
   * This should only happen in the edge cases where a start or due date is
   * being deleted and there is a recurring task with a recurrence basis that
   * matches the date being deleted.
   */
  function handleDialogConfirm() {
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
  title={dialogTitle}
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
