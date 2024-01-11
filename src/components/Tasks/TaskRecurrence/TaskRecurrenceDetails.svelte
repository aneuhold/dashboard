<!--
  @component
  
  The details of recurrence on a task. This should currently only be used in
  the `TaskRecurrenceInfo` component.
-->
<script lang="ts">
  import { RecurrenceFrequencyType, type RecurrenceInfo } from '@aneuhold/core-ts-db-lib';
  import Select, { Option } from '@smui/select';
  import InfoIcon from 'components/InfoIcon.svelte';
  import InputBox from 'components/InputBox.svelte';
  import { createEventDispatcher } from 'svelte';
  import { writable, type Updater } from 'svelte/store';

  export let disabled = true;
  export let recurrenceInfo: RecurrenceInfo;

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
        newRInfo.frequency.weekDaySet = new Set<number>([0, 3]);
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
      <InfoIcon
        title="Recurrence Frequency"
        content="Something Something Something SomethingSomethingSomethingSomethingSomethingSomethingSomethingSomethingSomethingSomethingSomethingSomethingSomethingSomething"
      />
    </div>

    <Select bind:disabled bind:value={$rInfo.frequency.type}>
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
          bind:disable={disabled}
          bind:onBlurValue={$rInfo.frequency.everyXTimeUnit.x}
        />
        <Select bind:disabled bind:value={$rInfo.frequency.everyXTimeUnit.timeUnit}>
          <Option value="day">Days</Option>
          <Option value="week">Weeks</Option>
          <Option value="month">Months</Option>
          <Option value="year">Years</Option>
        </Select>
      </div>
    {/if}
  </div>
  <hr />
  <div class="content">
    <b>Basis</b>
  </div>
  <hr />
  <div class="content extraMarginBottom">
    <b>Effect</b>
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
