<!--
  @component
  
  A page for entertainment things, like games and stuff like that.
-->
<script lang="ts">
  import PageTitle from '$components/PageTitle.svelte';
  import Paper, { Content, Title } from '@smui/paper';
  import { entertainmentPageInfo } from './pageInfo';
</script>

<svelte:head>
  <title>{entertainmentPageInfo.shortTitle}</title>
  <meta name="description" content={entertainmentPageInfo.description} />
</svelte:head>

<PageTitle title={entertainmentPageInfo.shortTitle} subtitle={entertainmentPageInfo.description} />
<div class="content">
  <Paper>
    <Title>Some stuff</Title>
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
