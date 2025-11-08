<script lang="ts">
  import { DateService } from '@aneuhold/core-ts-lib';

  interface Props {
    originalStartDate?: Date | undefined;
    originalDueDate?: Date | undefined;
    newStartDate?: Date | undefined;
    newDueDate?: Date | undefined;
    recurrenceIsRemoved?: boolean;
    recurrenceIsAdded?: boolean;
    completedRemoved?: boolean;
  }

  let {
    originalStartDate = undefined,
    originalDueDate = undefined,
    newStartDate = undefined,
    newDueDate = undefined,
    recurrenceIsRemoved = false,
    recurrenceIsAdded = false,
    completedRemoved = false
  }: Props = $props();

  let noChangesAtAll = $derived(
    !originalStartDate &&
      !originalDueDate &&
      !newStartDate &&
      !newDueDate &&
      !recurrenceIsRemoved &&
      !recurrenceIsAdded &&
      !completedRemoved
  );
</script>

{#if noChangesAtAll}
  <i class="dimmed-color">No changes</i>
{/if}
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
{#if completedRemoved}
  <li>
    Completed:
    <span class="dimmed-color crossedOut">Yes</span>
    No
  </li>
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
