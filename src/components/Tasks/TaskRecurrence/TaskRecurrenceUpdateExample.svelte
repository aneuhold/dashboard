<script lang="ts">
  import { DateService } from '@aneuhold/core-ts-lib';

  export let originalStartDate: Date | undefined = undefined;
  export let originalDueDate: Date | undefined = undefined;
  export let newStartDate: Date | undefined = undefined;
  export let newDueDate: Date | undefined = undefined;
  export let recurrenceIsRemoved: boolean = false;
  export let recurrenceIsAdded: boolean = false;
</script>

{#if recurrenceIsRemoved}
  <li>
    Recurring:
    <span class="dimmed-color crossedOut">Yes</span>
    No
  </li>
{/if}
{#if recurrenceIsAdded}
  <li>Recurring: Yes</li>
{/if}
{#if originalStartDate || newStartDate}
  <li>
    Start Date:
    {#if originalStartDate}
      <span class="dimmed-color crossedOut">
        {DateService.getAutoDateString(originalStartDate)}
      </span>
    {/if}
    {#if newStartDate}
      {DateService.getAutoDateString(newStartDate)}
    {/if}
  </li>
{/if}
{#if originalDueDate || newDueDate}
  <li>
    Due Date:
    {#if originalDueDate}
      <span class="dimmed-color crossedOut">
        {DateService.getAutoDateString(originalDueDate)}
      </span>
    {/if}
    {#if newDueDate}
      {DateService.getAutoDateString(newDueDate)}
    {/if}
  </li>
{/if}

<style>
  .crossedOut {
    text-decoration: line-through;
  }
</style>
