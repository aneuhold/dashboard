<!--
  @component
  
  A page for entertainment things, like games and stuff like that.
-->
<script lang="ts">
  import PageTitle from '$components/PageTitle.svelte';
  import Paper, { Content, Title } from '@smui/paper';
  import { nonogramKatanaBuildingsPageInfo } from './pageInfo';

  // What should be the data structure for the info here?
</script>

<svelte:head>
  <title>{nonogramKatanaBuildingsPageInfo.shortTitle}</title>
  <meta name="description" content={nonogramKatanaBuildingsPageInfo.description} />
</svelte:head>

<PageTitle
  title={nonogramKatanaBuildingsPageInfo.shortTitle}
  subtitle={nonogramKatanaBuildingsPageInfo.description}
/>
<div class="content">
  <Paper>
    <Title>Something</Title>
    <Content>Something here</Content>
  </Paper>
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
