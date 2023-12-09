<script lang="ts" context="module">
  export const homePageInfo: PageInfo = {
    shortTitle: 'Home',
    title: 'Personal Dashboard',
    description: 'Home page for the personal dashboard',
    url: '/',
    clickAction: () => {
      goto(homePageInfo.url);
    }
  };
</script>

<script lang="ts">
  import { goto } from '$app/navigation';
  import navInfo, { type PageInfo } from '../util/navInfo';
  import LinkList from 'components/LinkList.svelte';
  import type { LinkInfo } from 'components/LinkListItem.svelte';
  import Paper, { Content } from '@smui/paper';

  const links: Array<LinkInfo> = [navInfo.dev];
</script>

<svelte:head>
  <title>{homePageInfo.title}</title>
  <meta name="description" content={homePageInfo.description} />
</svelte:head>

<div class="title">
  <h4>{homePageInfo.title}</h4>
</div>

<Paper>
  <Content>
    <LinkList {links} />
  </Content>
</Paper>

<style>
  .title {
    display: flex;
    justify-content: center;
  }
</style>
