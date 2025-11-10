<!--
  @component
  
  A date picker dialog. This component is a wrapper around the SveltyPicker 
  component. Quite a bit of override CSS is in `globalStyles/sveltyPicker.css`

  At the moment it doesn't seem like this needs to be a singleton, but if
  it gets used more than just on the TaskDetails component, then it should.
-->
<script lang="ts">
  import { DateService } from '@aneuhold/core-ts-lib';
  import Button, { Label } from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import { Actions, Content, Title } from '@smui/dialog';
  import FormField from '@smui/form-field';
  import SveltyPicker, { formatDate } from 'svelty-picker';
  import { en } from 'svelty-picker/i18n';
  import SmartDialog from '$components/presentational/SmartDialog.svelte';

  /**
   * Pulled from the library. See docs here: https://svelty-picker.vercel.app/properties
   */
  type DateChange = {
    value: string | string[] | null;
    dateValue: Date | Date[] | null;
    displayValue: string | null;
    valueFormat: string | null;
    displayFormat: string | null;
    event: 'date' | 'hour' | 'minute' | 'datetime'; // which event triggered the callback
  };

  let {
    title = 'Pick a date',
    open = $bindable(),
    dateIsEndDate = false,
    initialDate,
    startDate,
    endDate,
    onSelected
  }: {
    title?: string;
    open: boolean;
    /**
     * Determines if the date is an end date. If it is, and time is not
     * specified by the user, the time will automatically be set to 23:59:59.
     */
    dateIsEndDate?: boolean;
    initialDate?: Date;
    /**
     * The first date that should be available for selection. This can be setup
     * with a time attached in the same date too.
     */
    startDate?: Date;
    /**
     * The last date that should be available for selection. This can be setup
     * with a time attached in the same date too.
     */
    endDate?: Date;
    /**
     * Callback fired when a date is selected (Done button clicked).
     */
    onSelected?: (date: Date | null) => void;
  } = $props();

  // Track mode state separately - initialize based on initialDate
  let modeState = $state<'date' | 'datetime'>(
    initialDate ? (DateService.dateHasTime(initialDate) ? 'datetime' : 'date') : 'date'
  );

  let currentlySelectedDate = $state(initialDate);

  /**
   * The formatted date string for the SveltyPicker component. This took quite a while to figure
   * out. Make sure to leave this logic as is. SveltyPicker is very particular about how it gets
   * its date strings.
   */
  let datePickerFormattedDate = $derived(
    currentlySelectedDate
      ? formatDate(currentlySelectedDate, 'yyyy-mm-dd hh:ii:ss', en, 'standard')
      : ''
  );

  // Delayed visibility for smooth dialog close animation
  let pickerVisible = $state(false);

  // Reset state when dialog opens, delay hiding picker when closing
  $effect(() => {
    if (open) {
      currentlySelectedDate = initialDate;
      pickerVisible = true;
      modeState = initialDate
        ? DateService.dateHasTime(initialDate)
          ? 'datetime'
          : 'date'
        : 'date';
    } else {
      // Delay hiding picker to let dialog animation complete
      setTimeout(() => {
        pickerVisible = false;
      }, 200);
    }
  });

  const handleTimeBoxClicked = () => {
    modeState = modeState === 'date' ? 'datetime' : 'date';
  };

  const handleDone = () => {
    if (dateIsEndDate && currentlySelectedDate && modeState === 'date') {
      currentlySelectedDate.setHours(23, 59, 59);
    }
    onSelected?.(currentlySelectedDate ?? null);
    open = false;
  };

  const handleCancel = () => {
    open = false;
  };

  const handleDateChange = (event: DateChange) => {
    if (event.dateValue instanceof Date) {
      currentlySelectedDate = event.dateValue;
    } else {
      currentlySelectedDate = undefined;
    }
  };
</script>

<SmartDialog bind:open>
  <Title>{title}</Title>
  <Content>
    <div class="picker-container">
      {#if pickerVisible}
        {#key modeState}
          <SveltyPicker
            {startDate}
            {endDate}
            value={datePickerFormattedDate}
            mode={modeState}
            weekStart={0}
            pickerOnly={true}
            onDateChange={handleDateChange}
          />
        {/key}
      {/if}
      <FormField>
        <Checkbox checked={modeState === 'datetime'} onclick={handleTimeBoxClicked} touch />
        {#snippet label()}
          <span>Use Time</span>
        {/snippet}
      </FormField>
    </div>
  </Content>
  <Actions>
    <Button onclick={handleCancel}>
      <Label>Cancel</Label>
    </Button>
    <Button onclick={handleDone}>
      <Label>Done</Label>
    </Button>
  </Actions>
</SmartDialog>

<style>
  .picker-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
