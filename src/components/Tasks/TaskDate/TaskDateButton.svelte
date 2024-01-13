<script lang="ts">
  import Chip, { LeadingIcon, Set, Text } from '@smui/chips';
  import { createEventDispatcher } from 'svelte';
  import DateService from 'util/DateService';

  export let dateType: 'due' | 'start';
  export let date: Date | undefined = undefined;

  $: dateTitle = dateType === 'due' ? 'Due Date' : 'Start Date';
  $: dateValue = date ? DateService.getAutoDateString(date) : 'Not Set';

  const dispatch = createEventDispatcher();
</script>

<div class="container">
  <span class={`mdc-typography--body2${date ? '' : ' dimmed-color'}`}>{dateTitle}</span>
  <Set chips={['one']} let:chip>
    <Chip
      {chip}
      class={date ? '' : 'dimmed-color'}
      shouldRemoveOnTrailingIconClick={false}
      on:click={() => dispatch('click')}
    >
      <LeadingIcon class="material-icons">event</LeadingIcon>
      <Text>{dateValue}</Text>
    </Chip>
  </Set>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
