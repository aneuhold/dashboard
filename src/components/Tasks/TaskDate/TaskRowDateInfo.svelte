<script lang="ts">
  import { DateService } from '@aneuhold/core-ts-lib';
  import TaskService from 'util/Task/TaskService';

  export let taskId: string;
  $: task = TaskService.getTaskStore(taskId);
  $: pastDue = $task.dueDate && $task.dueDate < new Date();
</script>

<div class="container mdc-typography--caption mdc-theme--text-hint-on-background">
  {#if $task.startDate}
    <span class="date">Starts: {DateService.getDateString($task.startDate)}</span>
  {/if}
  {#if $task.dueDate}
    <span class={`date${pastDue ? ' pastDue' : ''}`}>
      Due: {DateService.getDateString($task.dueDate)}
    </span>
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 4px;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .pastDue {
    color: var(--mdc-theme-error);
  }
  .date {
    border: 1px solid var(--mdc-theme-text-hint-on-background);
    padding: 0px 4px;
    border-radius: 8px;
  }
</style>
