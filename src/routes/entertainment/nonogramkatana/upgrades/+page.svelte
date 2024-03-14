<script lang="ts">
  import PageTitle from '$components/PageTitle.svelte';
  import Paper, { Content, Title } from '@smui/paper';
  import { nonogramKatanaUpgradesPageInfo } from './pageInfo';

  // What should be the data structure for the info here?
</script>

<svelte:head>
  <title>{nonogramKatanaUpgradesPageInfo.shortTitle}</title>
  <meta name="description" content={nonogramKatanaUpgradesPageInfo.description} />
</svelte:head>

<PageTitle
  title={nonogramKatanaUpgradesPageInfo.shortTitle}
  subtitle={nonogramKatanaUpgradesPageInfo.description}
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
