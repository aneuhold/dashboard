<script lang="ts" context="module">
  export const homePageInfo: PageInfo = {
    shortTitle: 'Home',
    title: 'Personal Dashboard',
    description: 'Home page for the personal dashboard',
    url: '/',
    clickAction: () => {
      goto(homePageInfo.url);
    },
    nestingLevel: 0,
    isInternalLink: true
  };
</script>

<script lang="ts">
  import { goto } from '$app/navigation';
  import Paper, { Content, Title } from '@smui/paper';
  import LinkList from 'components/LinkList.svelte';
  import type { LinkInfo } from 'components/LinkListItem.svelte';
  import PageTitle from 'components/PageTitle.svelte';
  import navInfo, { type PageInfo } from '../util/navInfo';

  const links: Array<LinkInfo> = [navInfo.dev, navInfo.finance];
</script>

<svelte:head>
  <title>{homePageInfo.title}</title>
  <meta name="description" content={homePageInfo.description} />
</svelte:head>

<PageTitle title={homePageInfo.title} />

<Paper>
  <Title>Table of Contents</Title>
  <Content>
    <LinkList {links} />
  </Content>
</Paper>
