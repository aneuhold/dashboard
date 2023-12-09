<!--
  @component
  
  A generic list of links.
-->
<script lang="ts">
  import List from '@smui/list';
  import type { LinkInfo } from './LinkListItem.svelte';
  import LinkListItem from './LinkListItem.svelte';

  export let links: Array<LinkInfo>;
</script>

<List twoLine={true}>
  {#each links as linkInfo}
    <LinkListItem {linkInfo} />
  {/each}
</List>
