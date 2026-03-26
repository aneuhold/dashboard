<!--
  @component

  Admin landing page. Shows a list of admin sub-pages.
-->
<script lang="ts">
  import Paper, { Content, Title } from '@smui/paper';
  import LinkList from '$components/LinkList.svelte';
  import type { LinkInfo } from '$components/LinkListItem.svelte';
  import PageTitle from '$components/PageTitle.svelte';
  import { adminPageInfo } from './pageInfo';
  import { adminUsersPageInfo } from './users/pageInfo';

  const subPageLinks: Array<LinkInfo> = [adminUsersPageInfo];
</script>

<svelte:head>
  <title>{adminPageInfo.shortTitle}</title>
  <meta name="description" content={adminPageInfo.description} />
</svelte:head>

<PageTitle title={adminPageInfo.shortTitle} subtitle={adminPageInfo.description} />
<div class="content">
  <Paper>
    <Title>Manage</Title>
    <Content>
      <LinkList links={subPageLinks} />
    </Content>
  </Paper>
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
