<script lang="ts">
  import DatePickerDialog from '$components/presentational/DatePickerDialog.svelte';
  import { confirmationDialog } from '$components/singletons/dialogs/SingletonConfirmationDialog.svelte';
  import { RecurrenceBasis } from '@aneuhold/core-ts-db-lib';
  import { DateService } from '@aneuhold/core-ts-lib';
  import { TaskMapService } from '../../../services/Task/TaskMapService/TaskMapService';
  import TaskRecurrenceService from '../../../services/Task/TaskRecurrenceService';
  import TaskDateButton from './TaskDateButton.svelte';

  interface Props {
    taskId: string;
  }

  let { taskId }: Props = $props();
  let task = $derived(TaskMapService.getTaskStore(taskId));

  let currentlyChosenDateType: 'start' | 'due' = $state('start');
  let datePickerOpen = $state(false);
  let dateName = $derived(currentlyChosenDateType === 'start' ? 'Start Date' : 'Due Date');
  let currentlyChosenDate = $derived(
    currentlyChosenDateType === 'start' ? $task.startDate : $task.dueDate
  );
  let oppositeDate = $derived(
    currentlyChosenDateType === 'start' ? $task.dueDate : $task.startDate
  );
  let oppositeDateName = $derived(currentlyChosenDateType === 'start' ? 'Due Date' : 'Start Date');
  let basisIsSameAsChosenDate = $derived(
    currentlyChosenDateType === 'start'
      ? $task.recurrenceInfo?.recurrenceBasis === RecurrenceBasis.startDate
      : $task.recurrenceInfo?.recurrenceBasis === RecurrenceBasis.dueDate
  );

  function handleStartDateClick() {
    currentlyChosenDateType = 'start';
    datePickerOpen = true;
  }
  function handleDueDateClick() {
    currentlyChosenDateType = 'due';
    datePickerOpen = true;
  }

  function handleSelectedDate(newDate: Date | null) {
    const date = newDate ? newDate : undefined;
    datePickerOpen = false;
    if (!DateService.datesAreEqual(currentlyChosenDate, date)) {
      if (!date) {
        handleDateDeletion();
      } else {
        handleDateUpdate(date);
      }
    }
  }

  /**
   * Handles the case where the date is being deleted, and it previously
   * existed.
   */
  function handleDateDeletion() {
    if (!$task.parentRecurringTaskInfo && basisIsSameAsChosenDate) {
      // If the opposite date is defined
      if (oppositeDate) {
        confirmationDialog.open({
          title: `Update recurrence basis from ${dateName} to ${oppositeDateName}?`,
          message:
            `This task is recurring and the basis is currently set to the ${dateName}. ` +
            `Deleting the ${dateName} will cause the basis to be switched to the ${oppositeDateName}. ` +
            `Would you like to switch the basis to the ${oppositeDateName}?`,
          onConfirm: () => {
            task.update((task) => {
              if (!task.recurrenceInfo) {
                console.error(
                  'Task had no recurrence info while trying to update recurrence basis!'
                );
                return task;
              }
              if (currentlyChosenDateType === 'start') {
                task.startDate = undefined;
                task.recurrenceInfo.recurrenceBasis = RecurrenceBasis.dueDate;
              } else {
                task.dueDate = undefined;
                task.recurrenceInfo.recurrenceBasis = RecurrenceBasis.startDate;
              }
              return task;
            });
          }
        });
        return;
      } else {
        confirmationDialog.open({
          title: 'Disable recurring on this task?',
          message:
            `This task is currently recurring, the basis is set to ${dateName} ` +
            `and there isn't a ${oppositeDateName} to switch to. Do you want ` +
            `to disable recurring on this task?`,
          onConfirm: () => {
            task.update((task) => {
              if (currentlyChosenDateType === 'start') {
                task.startDate = undefined;
              } else {
                task.dueDate = undefined;
              }
              task.recurrenceInfo = undefined;
              return task;
            });
          }
        });
        return;
      }
    }
    // Otherwise, if there are no recurrence things to consider
    updateDate(undefined);
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
        confirmationDialog.open({
          title: `Update ${dateName} to before recurrence date?`,
          message:
            `This task is recurring and the basis is currently set to the ${dateName}. ` +
            `Updating the ${dateName} to ${DateService.getAutoDateString(newDate)} will ` +
            ` cause the recurrence date to be ${DateService.getDateTimeString(
              simulatedRecurrenceDate
            )} which is before right now. ` +
            `This will cause the task to be updated as if the recurrence has triggered. ` +
            `Are you sure you want to do this?`,
          onConfirm: () => {
            updateDate(newDate);
          }
        });
        return;
      }
    }
    // If no recurrence things need to be considered
    updateDate(newDate);
  }

  /**
   * Just updates the date, nothing else is considered.
   *
   * @param newDate The new date to set
   */
  function updateDate(newDate: Date | undefined) {
    if (currentlyChosenDateType === 'start') {
      $task.startDate = newDate;
    } else {
      $task.dueDate = newDate;
    }
  }
</script>

<div class="container">
  <TaskDateButton dateType="start" onclick={handleStartDateClick} date={$task.startDate} />
  <TaskDateButton dateType="due" onclick={handleDueDateClick} date={$task.dueDate} />
</div>

<DatePickerDialog
  bind:open={datePickerOpen}
  title={dateName}
  startDate={currentlyChosenDateType === 'due' ? $task.startDate : undefined}
  endDate={currentlyChosenDateType === 'start' ? $task.dueDate : undefined}
  dateIsEndDate={currentlyChosenDateType === 'due'}
  onselected={handleSelectedDate}
  initialDate={currentlyChosenDate}
/>

<style>
  .container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
  }
</style>
