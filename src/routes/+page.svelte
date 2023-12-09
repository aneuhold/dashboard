<script lang="ts" context="module">
  export const homePageInfo: PageInfo = {
    shortTitle: 'Home',
    title: 'Personal Dashboard',
    description: 'Home page for the personal dashboard',
    url: '/',
    clickAction: () => {
      goto(homePageInfo.url);
    },
    nestingLevel: 0
  };
</script>

<script lang="ts">
  import { goto } from '$app/navigation';
  import navInfo, { type PageInfo } from '../util/navInfo';
  import LinkList from 'components/LinkList.svelte';
  import type { LinkInfo } from 'components/LinkListItem.svelte';
  import Paper, { Content } from '@smui/paper';
  import PageTitle from 'components/PageTitle.svelte';

  const links: Array<LinkInfo> = [navInfo.dev, navInfo.finance];
</script>

<svelte:head>
  <title>{homePageInfo.title}</title>
  <meta name="description" content={homePageInfo.description} />
</svelte:head>

<PageTitle title={homePageInfo.title} />

<Paper>
  <Content>
    <LinkList {links} />
  </Content>
</Paper>
