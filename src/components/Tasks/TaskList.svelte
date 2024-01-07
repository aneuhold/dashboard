<!--
  @component
  
  A list of tasks.
-->
<script lang="ts">
  import TaskRow from 'components/Tasks/TaskRow.svelte';

  export let taskIds: string[];
</script>

<div class="content">
  {#each taskIds as taskId}
    <TaskRow {taskId} />
  {/each}
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
