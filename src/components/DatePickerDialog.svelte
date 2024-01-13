<!--
  @component
  
  A date picker dialog. This component is a wrapper around the SveltyPicker 
  component. Quite a bit of override CSS is in `globalStyles/sveltyPicker.css`
-->
<script lang="ts">
  import Button, { Label } from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import Dialog, { Actions, Content, Title } from '@smui/dialog';
  import FormField from '@smui/form-field';
  import { createEventDispatcher } from 'svelte';
  import SveltyPicker from 'svelty-picker';
  import DateService from 'util/DateService';

  export let title: string = 'Pick a date';
  export let open: boolean;
  /**
   * Determines if the date is an end date. If it is, and time is not
   * specified by the user, the time will automatically be set to 23:59:59.
   */
  export let dateIsEndDate: boolean = false;
  export let initialDate: Date | undefined = undefined;
  /**
   * The first date that should be available for selection. This can be setup
   * with a time attached in the same date too.
   */
  export let startDate: Date | undefined = undefined;
  /**
   * The last date that should be available for selection. This can be setup
   * with a time attached in the same date too.
   */
  export let endDate: Date | undefined = undefined;

  let mode: 'date' | 'datetime' = 'date';
  $: mode = initialDate ? (DateService.dateHasTime(initialDate) ? 'datetime' : 'date') : 'date';
  let currentlySelectedDate: Date | null = null;
  $: currentlySelectedDate = initialDate ? initialDate : null;

  const dispatch = createEventDispatcher<{
    selected: Date | null;
  }>();

  const handleTimeBoxClicked = () => {
    mode = mode === 'date' ? 'datetime' : 'date';
  };

  const handleDone = () => {
    if (dateIsEndDate && currentlySelectedDate && mode === 'date') {
      currentlySelectedDate.setHours(23, 59, 59, 999);
    }
    dispatch('selected', currentlySelectedDate);
    open = false;
  };

  const handleChange = (event: CustomEvent<{ dateValue: Date | null }>) => {
    currentlySelectedDate = event.detail.dateValue;
  };
</script>

<Dialog bind:open>
  <Title>{title}</Title>
  <Content>
    <SveltyPicker
      {startDate}
      {endDate}
      {initialDate}
      {mode}
      pickerOnly={true}
      on:dateChange={handleChange}
    />
    <FormField>
      <Checkbox checked={mode === 'datetime'} on:click={handleTimeBoxClicked} touch />
      <span slot="label">Use Time</span>
    </FormField>
  </Content>
  <Actions>
    <Button on:click={handleDone}>
      <Label>Done</Label>
    </Button>
  </Actions>
</Dialog>
