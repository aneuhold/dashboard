<!--
  @component
  
  A page for Financial info.
-->
<script lang="ts" context="module">
  import { goto } from '$app/navigation';
  import type { PageInfo } from 'util/navInfo';

  export const financePageInfo: PageInfo = {
    shortTitle: 'Finance',
    title: 'Financial Info and Links',
    description: 'General financial information and links',
    url: '/finance',
    iconName: 'attach_money',
    clickAction: () => {
      goto(financePageInfo.url);
    },
    nestingLevel: 0
  };
</script>

<script lang="ts">
  import PageTitle from 'components/PageTitle.svelte';
</script>

<svelte:head>
  <title>{financePageInfo.shortTitle}</title>
  <meta name="description" content={financePageInfo.description} />
</svelte:head>

<PageTitle title={financePageInfo.shortTitle} subtitle={financePageInfo.description} />
