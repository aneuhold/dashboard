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
  import Select, { Option } from '@smui/select';
  import InputBox from 'components/InputBox.svelte';
  import WeekdaySegmentedButton from 'components/WeekdaySegmentedButton.svelte';
  import { createEventDispatcher } from 'svelte';
  import { writable, type Updater } from 'svelte/store';
  import TaskRecurrenceInfoIcon from './TaskRecurrenceInfoIcon.svelte';
  import TaskRecurrenceWeekdayOfMonth from './TaskRecurrenceWeekdayOfMonth.svelte';

  export let disabled = true;
  export let recurrenceInfo: RecurrenceInfo;
  export let hasStartDate: boolean;
  export let hasDueDate: boolean;

  $: rInfo = createRInfoStore(recurrenceInfo);

  const dispatch = createEventDispatcher<{
    change: RecurrenceInfo;
  }>();

  function createRInfoStore(initialRInfo: RecurrenceInfo) {
    let currentFrequencyType = initialRInfo.frequency.type;
    const { set, subscribe } = writable<RecurrenceInfo>(initialRInfo);

    const setRInfo = (newRInfo: RecurrenceInfo) => {
      if (newRInfo.frequency.type !== currentFrequencyType) {
        handleTypeChange(newRInfo);
      }
      currentFrequencyType = newRInfo.frequency.type;
      set(newRInfo);
      dispatch('change', newRInfo);
    };
    return {
      subscribe,
      set: (value: RecurrenceInfo) => {
        setRInfo(value);
      },
      update: (value: RecurrenceInfo, updater: Updater<RecurrenceInfo>) => {
        const newRInfo = updater(value);
        setRInfo(newRInfo);
      }
    };
  }

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
    {#if !hasStartDate && !hasDueDate}
      <span class="mdc-typography--body2 dimmed-color">
        A start date or a due date must be set to pick a basis
      </span>
    {:else}
      <Select
        disabled={disabled || !hasStartDate || !hasDueDate}
        bind:value={$rInfo.recurrenceBasis}
      >
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
  </div>
</div>

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
