<!--
  @component
  
  A page for settings of the dashboard for the current user.
-->
<script lang="ts">
  import Paper, { Content } from '@smui/paper';
  import PageTitle from 'components/PageTitle.svelte';
  import { taskMap } from '../../stores/taskMap';
  import { tasksPageInfo } from './pageInfo';

  $: tasks = Object.values($taskMap);
</script>

<svelte:head>
  <title>{tasksPageInfo.shortTitle}</title>
  <meta name="description" content={tasksPageInfo.description} />
</svelte:head>

<PageTitle title={tasksPageInfo.shortTitle} subtitle={tasksPageInfo.description} />

<Paper>
  <Content>
    <div class="content">
      {#each tasks as task}
        <div class="task">
          <div class="taskName">{task.title}</div>
          <div class="taskDescription">{task.description}</div>
        </div>
      {/each}
    </div>
  </Content>
</Paper>

<style>
  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
</style>
