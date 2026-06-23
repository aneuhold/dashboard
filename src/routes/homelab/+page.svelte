<!--
  @component

  A page listing self-hosted homelab services and network infrastructure links.
-->
<script lang="ts">
  import Paper, { Content as PaperContent, Title } from '@smui/paper';
  import LinkList from '$components/LinkList.svelte';
  import type { LinkInfo } from '$components/LinkListItem.svelte';
  import PageNotFound from '$components/PageNotFound.svelte';
  import PageTitle from '$components/PageTitle.svelte';
  import DockerIcon from '$lib/svgs/DockerIcon.svelte';
  import PiHoleIcon from '$lib/svgs/PiHoleIcon.svelte';
  import UbiquitiIcon from '$lib/svgs/UbiquitiIcon.svelte';
  import { userConfig } from '$stores/local/userConfig/userConfig';
  import { homelabPageInfo } from './pageInfo';

  const networkLinks: Array<LinkInfo> = [
    {
      title: 'Pi-hole',
      description: 'DNS filtering and query logs',
      clickAction: () => {
        window.open('http://pi3-bplus-1.local:8080/admin/login', '_blank');
      },
      icon: PiHoleIcon
    },
    {
      title: 'EdgeRouter X',
      description: 'Router configuration (EdgeOS)',
      clickAction: () => {
        window.open('https://192.168.0.2', '_blank');
      },
      icon: UbiquitiIcon
    }
  ];

  const testLinks: Array<LinkInfo> = [
    {
      title: 'whoami',
      description: 'Docker health-check container',
      clickAction: () => {
        window.open('http://pi3-b-1.local:8088', '_blank');
      },
      icon: DockerIcon
    }
  ];
</script>

<svelte:head>
  <title>{homelabPageInfo.title}</title>
  <meta name="description" content={homelabPageInfo.description} />
</svelte:head>

{#if !$userConfig.config.enabledFeatures.homelabPage}
  <PageNotFound />
{:else}
  <PageTitle title={homelabPageInfo.title} />

  <div class="content">
    <Paper>
      <Title>Network</Title>
      <PaperContent>
        <LinkList links={networkLinks} />
      </PaperContent>
    </Paper>
    <Paper>
      <Title>Test</Title>
      <PaperContent>
        <LinkList links={testLinks} />
      </PaperContent>
    </Paper>
  </div>
{/if}

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
