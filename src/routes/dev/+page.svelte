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
</script>

<svelte:head>
  <title>{devPageInfo.title}</title>
  <meta name="description" content={devPageInfo.title} />
</svelte:head>

<div class="title">
  <h4>{devPageInfo.title}</h4>
</div>

<Paper>
  <Title>🏢 Architecture 🏢</Title>
  <PaperContent>
    <List twoLine={true}>
      <Item on:SMUI:action={() => goto(`/dev/arch`)}>
        <Text>
          <PrimaryText>Architecture Contexts</PrimaryText>
          <SecondaryText>If building something</SecondaryText>
        </Text>
      </Item>
    </List>
  </PaperContent>
</Paper>

<style>
  .title {
    display: flex;
    justify-content: center;
  }
</style>
