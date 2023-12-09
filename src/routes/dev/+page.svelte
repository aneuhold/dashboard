<!--
  @component
  
  A page for Development info.

  Implementation notes:
  - SVG icons: https://worldvectorlogo.com/
-->
<script module lang="ts" context="module">
  export const devPageInfo: PageInfo = {
    shortTitle: 'Development',
    title: 'Development Links and Info',
    url: '/dev',
    iconName: 'code',
    clickAction: () => {
      goto(devPageInfo.url);
    },
    nestingLevel: 0
  };
</script>

<script lang="ts">
  import { goto } from '$app/navigation';
  import Paper, { Title, Content as PaperContent } from '@smui/paper';
  import NetlifyIcon from '$lib/svgs/NetlifyIcon.svelte';
  import DigitalOceanIcon from '$lib/svgs/DigitalOceanIcon.svelte';
  import MongoDbIcon from '$lib/svgs/MongoDBIcon.svelte';
  import type { PageInfo } from 'util/navInfo';
  import type { LinkInfo } from 'components/LinkListItem.svelte';
  import LinkList from 'components/LinkList.svelte';
  import navInfo from 'util/navInfo';
  import PageTitle from 'components/PageTitle.svelte';

  const architectureLinks: Array<LinkInfo> = [
    navInfo.devArch,
    {
      title: 'Netlify',
      description: 'Static site hosting',
      clickAction: () => {
        window.open('https://www.netlify.com/', '_blank');
      },
      icon: NetlifyIcon
    },
    {
      title: 'MongoDB Atlas',
      description: 'Cloud MongoDB Hosting. Login with Google account.',
      clickAction: () => {
        window.open('https://cloud.mongodb.com/v2/655933be7ffb754535fbb6af#/overview', '_blank');
      },
      icon: MongoDbIcon
    },
    {
      title: 'Digital Ocean',
      description: 'Cloud Hosting and Functions. Login with GitHub account.',
      clickAction: () => {
        window.open(
          'https://cloud.digitalocean.com/projects/286e35d0-0583-4d8c-8c70-bd3d0bca8aef/resources?i=228288',
          '_blank'
        );
      },
      icon: DigitalOceanIcon
    }
  ];

  const randomToolsLinks: Array<LinkInfo> = [
    {
      title: 'GitIgnore Generator',
      description: 'To generate .gitignore files',
      clickAction: () => {
        window.open('https://www.gitignore.io/', '_blank');
      },
      iconName: 'code'
    }
  ];
</script>

<svelte:head>
  <title>{devPageInfo.title}</title>
  <meta name="description" content={devPageInfo.title} />
</svelte:head>

<PageTitle title={devPageInfo.title} />

<div class="content">
  <Paper>
    <Title>Architecture</Title>
    <PaperContent>
      <LinkList links={architectureLinks} />
    </PaperContent>
  </Paper>
  <Paper>
    <Title>Random Tools</Title>
    <PaperContent>
      <LinkList links={randomToolsLinks} />
    </PaperContent>
  </Paper>
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
