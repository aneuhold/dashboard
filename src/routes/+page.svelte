<script lang="ts" context="module">
  export const homePageInfo: PageInfo = {
    title: 'Personal Dashboard',
    shortTitle: 'Home',
    description: 'Home page for the personal dashboard',
    url: '/'
  };
</script>

<script lang="ts">
  import { goto } from '$app/navigation';
  import List, { Item, Text, PrimaryText, SecondaryText } from '@smui/list';
  import navInfo, { type PageInfo } from '../util/navInfo';
</script>

<svelte:head>
  <title>{homePageInfo.title}</title>
  <meta name="description" content={homePageInfo.description} />
</svelte:head>

<div class="title">
  <h4>{homePageInfo.title}</h4>
</div>

<List twoLine={true}>
  <Item on:SMUI:action={() => goto(navInfo.dev.url)}>
    <Text>
      <PrimaryText>{navInfo.dev.shortTitle}</PrimaryText>
      <SecondaryText>{navInfo.dev.title}</SecondaryText>
    </Text>
  </Item>
</List>

<style>
  .title {
    display: flex;
    justify-content: center;
  }
</style>
