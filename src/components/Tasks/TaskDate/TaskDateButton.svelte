<script lang="ts">
  import { DateService } from '@aneuhold/core-ts-lib';
  import Chip, { LeadingIcon, Set, Text } from '@smui/chips';
  import { createEventDispatcher } from 'svelte';

  interface Props {
    dateType: 'due' | 'start';
    date?: Date | undefined;
  }

  let { dateType, date = undefined }: Props = $props();

  let dateTitle = $derived(dateType === 'due' ? 'Due Date' : 'Start Date');
  let dateValue = $derived(date ? DateService.getAutoDateString(date) : 'Not Set');

  const dispatch = createEventDispatcher();
</script>

<div class="container">
  <span class={`mdc-typography--body2${date ? '' : ' dimmed-color'}`}>{dateTitle}</span>
  <Set chips={['one']} >
    {#snippet children({ chip })}
        <Chip
        {chip}
        class={date ? '' : 'dimmed-color'}
        shouldRemoveOnTrailingIconClick={false}
        on:click={() => dispatch('click')}
      >
        <LeadingIcon class="material-icons">event</LeadingIcon>
        <Text>{dateValue}</Text>
      </Chip>
          {/snippet}
    </Set>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
