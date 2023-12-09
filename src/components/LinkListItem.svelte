<!--
  @component
  
  A list item that contains a link to some site or another page. This depends
  on there being a parent List component with `twoLines` set to true.
-->
<script lang="ts" context="module">
  import { Icon } from '@smui/icon-button';
  import { Graphic, Item, PrimaryText, SecondaryText, Text } from '@smui/list';
  import type { ComponentType } from 'svelte';

  export interface LinkInfo {
    title: string;
    description?: string;
    iconName?: string;
    icon?: ComponentType;
    clickAction: () => void;
    /**
     * Determines if the link is internal to the site or not. If it isn't,
     * then a link icon will be next to the title.
     */
    isInternalLink?: boolean;
  }
</script>

<script lang="ts">
  export let linkInfo: LinkInfo;
</script>

<Item on:SMUI:action={linkInfo.clickAction}>
  {#if linkInfo.iconName}
    <Graphic><Icon class="material-icons">{linkInfo.iconName}</Icon></Graphic>
  {/if}
  {#if linkInfo.icon}
    <Graphic><svelte:component this={linkInfo.icon} /></Graphic>
  {/if}
  <Text>
    <PrimaryText>
      {linkInfo.title}
      {#if !linkInfo.isInternalLink}
        <Icon class="material-icons dimmed-color x-small-icon">open_in_new</Icon>
      {/if}
    </PrimaryText>
    <SecondaryText>{linkInfo.description ? linkInfo.description : '...'}</SecondaryText>
  </Text>
</Item>
