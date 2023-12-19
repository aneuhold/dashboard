<!--
  @component
  
  A page for Automation tools.
-->
<script lang="ts" context="module">
  import { goto } from '$app/navigation';
  import type { PageInfo } from 'util/navInfo';

  export const automationPageInfo: PageInfo = {
    shortTitle: 'Automation',
    title: 'Automation',
    description: 'Automation actions and tools',
    url: '/automation',
    iconName: 'precision_manufacturing',
    clickAction: () => {
      goto(automationPageInfo.url);
    },
    nestingLevel: 0,
    isInternalLink: true
  };
</script>

<script lang="ts">
  import Paper, { Content, Subtitle, Title } from '@smui/paper';
  import LinkList from 'components/LinkList.svelte';
  import type { LinkInfo } from 'components/LinkListItem.svelte';
  import PageTitle from 'components/PageTitle.svelte';

  const automationActions: Array<LinkInfo> = [
    {
      title: 'Bed time but still watching shows',
      clickAction: () => {
        console.log('Nothing yet');
      },
      iconName: 'dark_mode'
    }
  ];

  const automationConfiguration: Array<LinkInfo> = [
    {
      title: 'Voice Monkey',
      description: 'Trigger Alexa routines from anywhere that can send a web request',
      clickAction: () => {
        window.open('https://console.voicemonkey.io/api-v2/playground?api=trigger', '_blank');
      },
      iconName: 'smart_toy'
    }
  ];
</script>

<svelte:head>
  <title>{automationPageInfo.shortTitle}</title>
  <meta name="description" content={automationPageInfo.description} />
</svelte:head>

<PageTitle title={automationPageInfo.shortTitle} subtitle={automationPageInfo.description} />
<div class="content">
  <Paper>
    <Title>Actions</Title>
    <Subtitle>All of these actually trigger a thing to happen</Subtitle>
    <Content>
      <LinkList links={automationActions} />
    </Content>
  </Paper>
  <Paper>
    <Title>Configuration</Title>
    <Content>
      <LinkList links={automationConfiguration} />
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
