<!--
  @component
  
  The details of recurrence on a task. This should currently only be used in
  the `TaskRecurrenceInfo` component.
-->
<script lang="ts">
  import {
    RecurrenceBasis,
    RecurrenceEffect,
    RecurrenceFrequencyType,
    type RecurrenceInfo
  } from '@aneuhold/core-ts-db-lib';
  import { DateService } from '@aneuhold/core-ts-lib';
  import Select, { Option } from '@smui/select';
  import ConfirmationDialog from 'components/ConfirmationDialog.svelte';
  import WeekdaySegmentedButton from 'components/WeekdaySegmentedButton.svelte';
  import InputBox from 'components/presentational/InputBox.svelte';
  import { writable, type Updater } from 'svelte/store';
  import TaskRecurrenceService from 'util/Task/TaskRecurrenceService';
  import { TaskMapService } from '../../../services/Task/TaskMapService';
  import TaskRecurrenceInfoIcon from './TaskRecurrenceInfoIcon.svelte';
  import TaskRecurrenceUpdateExample from './TaskRecurrenceUpdateExample.svelte';
  import TaskRecurrenceWeekdayOfMonth from './TaskRecurrenceWeekdayOfMonth.svelte';

  export let taskId: string;
  export let recurrenceInfo: RecurrenceInfo;

  let dialogMessage = '';
  let dialogOpen = false;

  $: task = TaskMapService.getTaskStore(taskId);
  /**
   * Stored so that the changes can be reverted
   */
  $: previousRInfoString = JSON.stringify(recurrenceInfo);
  $: pendingRInfo = recurrenceInfo;
  $: disabled = !$task.recurrenceInfo || !!$task.parentRecurringTaskInfo;
  $: startDate = $task.startDate;
  $: dueDate = $task.dueDate;
  $: parentRecurringTaskInfo = $task.parentRecurringTaskInfo;
  $: exampleOfRecurrence = TaskRecurrenceService.createExampleOfRecurrence(
    startDate,
    dueDate,
    recurrenceInfo,
    parentRecurringTaskInfo
  );
  $: rInfo = createRInfoStore(recurrenceInfo);

  function createRInfoStore(initialRInfo: RecurrenceInfo) {
    let currentFrequencyType = initialRInfo.frequency.type;
    const { set, subscribe } = writable<RecurrenceInfo>(initialRInfo);

    const setRInfo = (newRInfo: RecurrenceInfo, checkDate = true) => {
      if (newRInfo.frequency.type !== currentFrequencyType) {
        handleTypeChange(newRInfo);
      }
      currentFrequencyType = newRInfo.frequency.type;
      if (checkDate && updateWouldTriggerRecurrence(newRInfo)) {
        pendingRInfo = newRInfo;
        dialogOpen = true;
        return;
      }
      previousRInfoString = JSON.stringify(newRInfo);
      set(newRInfo);
      $task.recurrenceInfo = newRInfo;
    };
    return {
      subscribe,
      set: (value: RecurrenceInfo) => {
        setRInfo(value);
      },
      update: (value: RecurrenceInfo, updater: Updater<RecurrenceInfo>) => {
        const newRInfo = updater(value);
        setRInfo(newRInfo);
      },
      setWithoutCheck(value: RecurrenceInfo) {
        setRInfo(value, false);
      }
    };
  }

  const updateWouldTriggerRecurrence = (newRInfo: RecurrenceInfo) => {
    const simulatedDate = TaskRecurrenceService.getSimulatedRecurrenceDate($task, (task) => {
      task.recurrenceInfo = newRInfo;
      return task;
    });
    if (!simulatedDate) {
      return false;
    }
    if (simulatedDate < new Date()) {
      dialogMessage =
        `This update would case the next recurrence date to be ` +
        `${DateService.getDateTimeString(simulatedDate)} which is before now. ` +
        `This will cause the task to be updated immediately.` +
        `Are you sure you want to do this?`;
      return true;
    }
  };

  const handleDialogConfirm = () => {
    rInfo.setWithoutCheck(pendingRInfo);
    dialogOpen = false;
  };

  const handleDialogCancel = () => {
    rInfo.setWithoutCheck(JSON.parse(previousRInfoString));
    dialogOpen = false;
  };

  const handleTypeChange = (newRInfo: RecurrenceInfo) => {
    switch (newRInfo.frequency.type) {
      case RecurrenceFrequencyType.everyXTimeUnit:
        newRInfo.frequency.everyXTimeUnit = {
          timeUnit: 'week',
          x: 1
        };
        break;
      case RecurrenceFrequencyType.weekDaySet:
        newRInfo.frequency.weekDaySet = [];
        break;
      case RecurrenceFrequencyType.everyXWeekdayOfMonth:
        newRInfo.frequency.everyXWeekdayOfMonth = {
          weekDay: 1,
          weekOfMonth: 1
        };
        break;
      case RecurrenceFrequencyType.lastDayOfMonth:
        break;
    }
    clearOtherTypes(newRInfo);
  };

  const clearOtherTypes = (newRInfo: RecurrenceInfo) => {
    Object.keys(newRInfo.frequency).forEach((key) => {
      if (key !== newRInfo.frequency.type && key !== 'type') {
        // Little hacky, but does the job
        (newRInfo.frequency as { [key: string]: unknown })[key] = undefined;
      }
    });
  };
</script>

<div class={`${disabled ? ' dimmed-color' : ''}`}>
  <div class="content">
    <div class="flexRowWrap">
      <b>Frequency</b>
      <TaskRecurrenceInfoIcon />
    </div>
    <Select {disabled} bind:value={$rInfo.frequency.type}>
      <Option value={RecurrenceFrequencyType.everyXTimeUnit}>Every X Time Unit</Option>
      <Option value={RecurrenceFrequencyType.weekDaySet}>Every Set of Weekdays</Option>
      <Option value={RecurrenceFrequencyType.everyXWeekdayOfMonth}>Every X Weekday of Month</Option>
      <Option value={RecurrenceFrequencyType.lastDayOfMonth}>Last Day of Every Month</Option>
    </Select>
    {#if $rInfo.frequency.everyXTimeUnit}
      <div class="flexRowWrap">
        <span>Recurring every</span>
        <InputBox
          inputType="number"
          min={1}
          isSmall
          disable={disabled}
          bind:onBlurValue={$rInfo.frequency.everyXTimeUnit.x}
        />
        <Select {disabled} bind:value={$rInfo.frequency.everyXTimeUnit.timeUnit}>
          <Option value="day">Days</Option>
          <Option value="week">Weeks</Option>
          <Option value="month">Months</Option>
          <Option value="year">Years</Option>
        </Select>
      </div>
    {:else if $rInfo.frequency.weekDaySet}
      <WeekdaySegmentedButton {disabled} bind:weekDaySetOrChoice={$rInfo.frequency.weekDaySet} />
    {:else if $rInfo.frequency.everyXWeekdayOfMonth}
      <TaskRecurrenceWeekdayOfMonth
        bind:weekDay={$rInfo.frequency.everyXWeekdayOfMonth.weekDay}
        bind:weekOfMonth={$rInfo.frequency.everyXWeekdayOfMonth.weekOfMonth}
      />
    {/if}
  </div>
  <hr />
  <div class="content">
    <div class="flexRowWrap">
      <b>Basis</b>
      <TaskRecurrenceInfoIcon />
    </div>
    {#if !startDate && !dueDate}
      <span class="mdc-typography--body2 dimmed-color">
        A start date or a due date must be set to pick a basis
      </span>
    {:else}
      <Select disabled={disabled || !startDate || !dueDate} bind:value={$rInfo.recurrenceBasis}>
        <Option value={RecurrenceBasis.startDate}>Start Date</Option>
        <Option value={RecurrenceBasis.dueDate}>Due Date</Option>
      </Select>
    {/if}
  </div>
  <hr />
  <div class="content extraMarginBottom">
    <div class="flexRowWrap">
      <b>Effect</b>
      <TaskRecurrenceInfoIcon />
    </div>
    <Select {disabled} bind:value={$rInfo.recurrenceEffect}>
      <Option value={RecurrenceEffect.rollOnBasis}>Roll on Basis</Option>
      <Option value={RecurrenceEffect.rollOnCompletion}>Roll on Completion</Option>
      <Option value={RecurrenceEffect.stack}>Stack</Option>
    </Select>
    <div>
      <span>Updates on next task recurrence:</span>
      {#if $rInfo.recurrenceEffect === RecurrenceEffect.stack && !$task.completed}
        <ul>
          <li>This task</li>
          <ul>
            <TaskRecurrenceUpdateExample recurrenceIsRemoved={true} />
          </ul>
          <li>New Task</li>
          <ul>
            <TaskRecurrenceUpdateExample
              recurrenceIsAdded={true}
              newStartDate={exampleOfRecurrence.startDate}
              newDueDate={exampleOfRecurrence.dueDate}
            />
          </ul>
        </ul>
      {:else}
        <ul>
          <TaskRecurrenceUpdateExample
            originalStartDate={startDate}
            newStartDate={exampleOfRecurrence.startDate}
            originalDueDate={dueDate}
            newDueDate={exampleOfRecurrence.dueDate}
            completedRemoved={$task.completed}
          />
        </ul>
      {/if}
    </div>
  </div>
</div>

<ConfirmationDialog
  bind:open={dialogOpen}
  title="Are you sure?"
  message={dialogMessage}
  on:cancel={handleDialogCancel}
  on:confirm={handleDialogConfirm}
/>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 24px;
  }
  .flexRowWrap {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .extraMarginBottom {
    margin-bottom: 8px;
  }
  hr {
    width: 100%;
    border-color: var(--mdc-theme-secondary);
  }
</style>
