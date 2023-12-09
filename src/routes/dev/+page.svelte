<!--
  @component
  
  A page for Development info.

  Implementation notes:
  - SVG icons: https://worldvectorlogo.com/
-->
<script module lang="ts" context="module">
  export const devPageInfo: PageInfo = {
    title: 'Development Links and Info',
    shortTitle: 'Development',
    url: '/dev',
    iconName: 'code'
  };
</script>

<script lang="ts">
  import { goto } from '$app/navigation';
  import List, { Item, Text, PrimaryText, SecondaryText } from '@smui/list';
  import Paper, { Title, Content as PaperContent } from '@smui/paper';
  import type { PageInfo } from '../../util/navInfo';
  import Graphic from '@smui/list/src/Graphic.svelte';
  import { Icon } from '@smui/icon-button';
  import type { ComponentType } from 'svelte';
  import NetlifyIcon from '$lib/svgs/NetlifyIcon.svelte';
  import DigitalOceanIcon from '$lib/svgs/DigitalOceanIcon.svelte';
  import MongoDbIcon from '$lib/svgs/MongoDBIcon.svelte';

  type LinkInfo = {
    title: string;
    description: string;
    iconName?: string;
    icon?: ComponentType;
    clickAction: () => void;
  };

  const architectureLinks: Array<LinkInfo> = [
    {
      title: 'Architecture Contexts',
      description: 'If building something',
      clickAction: () => {
        goto(`/dev/arch`);
      },
      iconName: 'domain'
    },
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

<div class="title">
  <h4>{devPageInfo.title}</h4>
</div>
<div class="content">
  <Paper>
    <Title>Architecture</Title>
    <PaperContent>
      <List twoLine={true}>
        {#each architectureLinks as linkInfo}
          <Item on:SMUI:action={linkInfo.clickAction}>
            {#if linkInfo.iconName}
              <Graphic><Icon class="material-icons">{linkInfo.iconName}</Icon></Graphic>
            {/if}
            {#if linkInfo.icon}
              <Graphic><svelte:component this={linkInfo.icon} /></Graphic>
            {/if}
            <Text>
              <PrimaryText>{linkInfo.title}</PrimaryText>
              <SecondaryText>{linkInfo.description}</SecondaryText>
            </Text>
          </Item>
        {/each}
      </List>
    </PaperContent>
  </Paper>
  <Paper>
    <Title>Random Tools</Title>
    <PaperContent>
      <List twoLine={true}>
        {#each randomToolsLinks as linkInfo}
          <Item on:SMUI:action={linkInfo.clickAction}>
            {#if linkInfo.iconName}
              <Graphic><Icon class="material-icons">{linkInfo.iconName}</Icon></Graphic>
            {/if}
            {#if linkInfo.icon}
              <Graphic><svelte:component this={linkInfo.icon} /></Graphic>
            {/if}
            <Text>
              <PrimaryText>{linkInfo.title}</PrimaryText>
              <SecondaryText>{linkInfo.description}</SecondaryText>
            </Text>
          </Item>
        {/each}
      </List>
    </PaperContent>
  </Paper>
</div>

<style>
  .title {
    display: flex;
    justify-content: center;
  }
  .content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
