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
  import { tick } from 'svelte';
  import SveltyPicker from 'svelty-picker';
  import SmartDialog from './SmartDialog.svelte';

  let {
    title = 'Pick a date',
    open = $bindable(),
    dateIsEndDate = false,
    initialDate = undefined,
    startDate = undefined,
    endDate = undefined,
    onselected
  }: {
    title?: string;
    open: boolean;
    /**
     * Determines if the date is an end date. If it is, and time is not
     * specified by the user, the time will automatically be set to 23:59:59.
     */
    dateIsEndDate?: boolean;
    initialDate?: Date | undefined;
    /**
     * The first date that should be available for selection. This can be setup
     * with a time attached in the same date too.
     */
    startDate?: Date | undefined;
    /**
     * The last date that should be available for selection. This can be setup
     * with a time attached in the same date too.
     */
    endDate?: Date | undefined;
    /**
     * Callback fired when a date is selected (Done button clicked).
     */
    onselected?: (date: Date | null) => void;
  } = $props();

  /**
   * This is the actual dialog open state. This is needed so that svelty-picker
   * can regenerate each time, because of quite a lot of reactivity
   * problems with the component.
   *
   * Setting the svelty-picker value explicitly was already tried, so was
   * manually updating or clearing the value as well as restting the
   * initialDate. None of these worked.
   */
  let dialogOpen = $state(false);
  let sveltyPickerVisible = $state(false);
  let previousOpen = $state(false);

  // Track mode state separately - initialize based on initialDate
  let modeState = $state<'date' | 'datetime'>(
    initialDate ? (DateService.dateHasTime(initialDate) ? 'datetime' : 'date') : 'date'
  );

  let currentlySelectedDate = $state(initialDate);

  // Main reactivity logic for opening and closing the dialog
  $effect(() => {
    if (open && previousOpen !== open) {
      previousOpen = open;
      sveltyPickerVisible = true;
      currentlySelectedDate = initialDate;
      // Reset mode state when dialog opens
      modeState = initialDate
        ? DateService.dateHasTime(initialDate)
          ? 'datetime'
          : 'date'
        : 'date';
      tick().then(() => {
        dialogOpen = true;
      });
    } else if (!open && previousOpen !== open) {
      previousOpen = open;
      dialogOpen = false;
      // 200ms seemed like a good amount of time for the dialog to go away.
      setTimeout(() => {
        sveltyPickerVisible = false;
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
    onselected?.(currentlySelectedDate ?? null);
    open = false;
  };

  const handleCancel = () => {
    open = false;
  };

  const handleChange = (dateChange: {
    dateValue: Date | Date[] | null;
    value: string | string[] | null;
  }) => {
    const dateValue = dateChange.dateValue;
    currentlySelectedDate = dateValue && !Array.isArray(dateValue) ? dateValue : undefined;
  };
</script>

<SmartDialog bind:open={dialogOpen}>
  <Title>{title}</Title>
  <Content>
    {#if sveltyPickerVisible}
      <SveltyPicker
        {startDate}
        {endDate}
        value={initialDate?.toISOString() ?? null}
        mode={modeState}
        weekStart={0}
        pickerOnly={true}
        onDateChange={handleChange}
      />
    {/if}
    <FormField>
      <Checkbox checked={modeState === 'datetime'} onclick={handleTimeBoxClicked} touch />
      {#snippet label()}
        <span>Use Time</span>
      {/snippet}
    </FormField>
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
