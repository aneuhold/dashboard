<!--
  @component
  
  A page for entertainment things, like games and stuff like that.
-->
<script lang="ts">
  import PageTitle from '$components/PageTitle.svelte';
  import Paper, { Content, Title } from '@smui/paper';
  import { nonogramKatanaPageInfo } from './pageInfo';
</script>

<svelte:head>
  <title>{nonogramKatanaPageInfo.shortTitle}</title>
  <meta name="description" content={nonogramKatanaPageInfo.description} />
</svelte:head>

<PageTitle
  title={nonogramKatanaPageInfo.shortTitle}
  subtitle={nonogramKatanaPageInfo.description}
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
