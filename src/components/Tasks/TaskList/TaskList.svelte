<!--
  @component
  
  A list of tasks.
-->
<script lang="ts">
  import TaskRow from 'components/Tasks/TaskRow.svelte';
  import { slide } from 'svelte/transition';
  import TaskListOptions from './TaskListOptions.svelte';

  export let taskIds: string[];
</script>

<div class="content">
  <TaskListOptions />
  {#each taskIds as taskId (taskId)}
    <div transition:slide>
      <TaskRow {taskId} />
    </div>
  {/each}
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
