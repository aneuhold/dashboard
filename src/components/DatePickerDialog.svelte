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

  export let title: string = 'Pick a date';
  export let open: boolean;
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

  let useTimeCheckboxChecked = false;
  let mode: 'datetime' | 'date' = 'date';

  let currentlySelectedDate: Date | null = null;

  const dispatch = createEventDispatcher<{
    selected: {
      date: Date | null;
      mode: 'date' | 'datetime';
    };
  }>();

  const toggleTimeCheckbox = () => {
    useTimeCheckboxChecked = !useTimeCheckboxChecked;
    mode = useTimeCheckboxChecked ? 'datetime' : 'date';
  };

  const handleDone = () => {
    dispatch('selected', {
      date: currentlySelectedDate,
      mode
    });
    open = false;
  };

  const handleChange = (event: CustomEvent<{ dateValue: Date | null }>) => {
    currentlySelectedDate = event.detail.dateValue;
    console.log('currentlySelectedDate', currentlySelectedDate);
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
      <Checkbox bind:checked={useTimeCheckboxChecked} on:click={toggleTimeCheckbox} touch />
      <span slot="label">Use Time</span>
    </FormField>
  </Content>
  <Actions>
    <Button on:click={handleDone}>
      <Label>Done</Label>
    </Button>
  </Actions>
</Dialog>
