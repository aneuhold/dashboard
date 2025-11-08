<!--
  @component
  
  A date picker dialog. This component is a wrapper around the SveltyPicker 
  component. Quite a bit of override CSS is in `globalStyles/sveltyPicker.css`

  At the moment it doesn't seem like this needs to be a singleton, but if
  it gets used more than just on the TaskDetails component, then it should.
-->
<script lang="ts">
  import { run } from 'svelte/legacy';

  import { DateService } from '@aneuhold/core-ts-lib';
  import Button, { Label } from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import { Actions, Content, Title } from '@smui/dialog';
  import FormField from '@smui/form-field';
  import { createEventDispatcher, tick } from 'svelte';
  import SveltyPicker from 'svelty-picker';
  import SmartDialog from './SmartDialog.svelte';

  interface Props {
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
  }

  let {
    title = 'Pick a date',
    open = $bindable(),
    dateIsEndDate = false,
    initialDate = undefined,
    startDate = undefined,
    endDate = undefined
  }: Props = $props();

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
  let mode: 'date' | 'datetime' = $state();
  run(() => {
    mode = initialDate ? (DateService.dateHasTime(initialDate) ? 'datetime' : 'date') : 'date';
  });
  let currentlySelectedDate = $derived(initialDate);

  // Main reactivity logic for opening and closing the dialog
  run(() => {
    if (open && previousOpen !== open) {
      previousOpen = open;
      sveltyPickerVisible = true;
      currentlySelectedDate = initialDate;
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

  const dispatch = createEventDispatcher<{
    selected: Date | null;
  }>();

  const handleTimeBoxClicked = () => {
    mode = mode === 'date' ? 'datetime' : 'date';
  };

  const handleDone = () => {
    if (dateIsEndDate && currentlySelectedDate && mode === 'date') {
      currentlySelectedDate.setHours(23, 59, 59);
    }
    dispatch('selected', currentlySelectedDate);
    open = false;
  };

  const handleCancel = () => {
    open = false;
  };

  const handleChange = (event: CustomEvent<{ dateValue: Date | null }>) => {
    currentlySelectedDate = event.detail.dateValue ? event.detail.dateValue : undefined;
  };
</script>

<SmartDialog bind:open={dialogOpen} on:SMUIDialog:closed={handleCancel}>
  <Title>{title}</Title>
  <Content>
    {#if sveltyPickerVisible}
      <SveltyPicker
        {startDate}
        {endDate}
        {initialDate}
        {mode}
        weekStart={0}
        pickerOnly={true}
        on:dateChange={handleChange}
      />
    {/if}
    <FormField>
      <Checkbox checked={mode === 'datetime'} on:click={handleTimeBoxClicked} touch />
      {#snippet label()}
        <span>Use Time</span>
      {/snippet}
    </FormField>
  </Content>
  <Actions>
    <Button on:click={handleCancel}>
      <Label>Cancel</Label>
    </Button>
    <Button on:click={handleDone}>
      <Label>Done</Label>
    </Button>
  </Actions>
</SmartDialog>
