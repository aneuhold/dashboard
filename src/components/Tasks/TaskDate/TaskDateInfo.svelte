<script lang="ts">
  import DatePickerDialog from 'components/DatePickerDialog.svelte';
  import TaskService from 'util/TaskService';
  import TaskDateButton from './TaskDateButton.svelte';

  export let taskId: string;
  $: task = TaskService.getTaskStore(taskId);

  let currentlyChosenDateType: 'start' | 'due' = 'start';
  let dialogOpen = false;
  $: dialogTitle = currentlyChosenDateType === 'start' ? 'Start Date' : 'Due Date';
  $: currentlyChosenDate = currentlyChosenDateType === 'start' ? $task.startDate : $task.dueDate;

  function handleStartDateClick() {
    currentlyChosenDateType = 'start';
    dialogOpen = true;
  }
  function handleDueDateClick() {
    currentlyChosenDateType = 'due';
    dialogOpen = true;
  }

  function handleSelectedDate(event: CustomEvent<Date | null>) {
    const newDate = event.detail ? event.detail : undefined;
    if (currentlyChosenDateType === 'start' && !datesAreEqual($task.startDate, newDate)) {
      $task.startDate = newDate;
    } else if (currentlyChosenDateType === 'due' && !datesAreEqual($task.dueDate, newDate)) {
      $task.dueDate = newDate;
    }
    dialogOpen = false;
  }

  function datesAreEqual(date1: Date | undefined | null, date2: Date | undefined | null) {
    if (!date1 && !date2) {
      return true;
    } else if (!date1 || !date2) {
      return false;
    } else {
      return date1.getTime() === date2.getTime();
    }
  }
</script>

<div class="container">
  <TaskDateButton dateType="start" on:click={handleStartDateClick} date={$task.startDate} />
  <TaskDateButton dateType="due" on:click={handleDueDateClick} date={$task.dueDate} />
</div>

<DatePickerDialog
  bind:open={dialogOpen}
  title={dialogTitle}
  startDate={currentlyChosenDateType === 'due' ? $task.startDate : undefined}
  endDate={currentlyChosenDateType === 'start' ? $task.dueDate : undefined}
  dateIsEndDate={currentlyChosenDateType === 'due'}
  on:selected={handleSelectedDate}
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
