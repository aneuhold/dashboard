<!--
  @component
  
  A list item that contains a link to some site or another page. This depends
  on there being a parent List component with `twoLines` set to true.
-->
<script lang="ts" context="module">
  import { Icon } from '@smui/icon-button';
  import { Graphic, Item, PrimaryText, Text, SecondaryText } from '@smui/list';
  import type { ComponentType } from 'svelte';

  export interface LinkInfo {
    title: string;
    description?: string;
    iconName?: string;
    icon?: ComponentType;
    clickAction: () => void;
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
    <PrimaryText>{linkInfo.title}</PrimaryText>
    <SecondaryText>{linkInfo.description}</SecondaryText>
  </Text>
</Item>

<style>
</style>
