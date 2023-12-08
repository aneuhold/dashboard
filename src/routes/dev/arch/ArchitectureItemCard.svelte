<!--
  @component

  An Architecture card that is made to look like a list item. The contents
  will be put into the description if contents are provided.

  Implementation notes:

  It had to be made to be a card instead of a list item because of clashing
  in styles when using the menu component.
-->
<script lang="ts">
  import List, { Graphic, Item, Text } from '@smui/list';
  import Card, { Content as CardContent } from '@smui/card';
  import type { ComponentType } from 'svelte';
  import MenuSurface from '@smui/menu-surface';
  import IconButton, { Icon } from '@smui/icon-button';
  import { ArchitectureComponentType } from '../../../util/ArchitectureInfo/architectureComponents';

  export let title: string;
  export let docsUrl: string | null = null;
  export let latestExampleProjectUrl: string | null = null;
  export let archComponentType: ArchitectureComponentType | null = null;
  export let iconComponent: ComponentType | null = null;

  function openUrl(url: string | null) {
    menu.setOpen(false);
    if (url) window.open(url, '_blank');
  }

  function getArchComponentTypeIconName() {
    switch (archComponentType) {
      case ArchitectureComponentType.language:
        return 'code';
      case ArchitectureComponentType.framework:
        return 'foundation';
      case ArchitectureComponentType.tool:
        return 'construction';
      default:
        return null;
    }
  }

  let menu: MenuSurface;
  let anchor: HTMLDivElement;
</script>

<div class="container">
  <Card variant="outlined">
    <CardContent>
      <div class="card-content">
        <div class="left-side">
          {#if iconComponent}
            <Icon class="material-icons"><svelte:component this={iconComponent} size={30} /></Icon>
          {/if}
          <div>
            <h4 class="mdc-typography--body1 title">
              {title}
              {#if archComponentType}
                <!-- Add a tooltip here -->
                <Icon class="material-icons dimmed-color small-icon">
                  {getArchComponentTypeIconName()}
                </Icon>
              {/if}
            </h4>
            {#if $$slots.default}
              <div class="mdc-deprecated-list-item__secondary-text subtitle"><slot /></div>
            {/if}
          </div>
        </div>
        {#if docsUrl || latestExampleProjectUrl}
          <div bind:this={anchor}>
            <IconButton class="material-icons dimmed-color" on:click={() => menu.setOpen(true)}>
              menu
            </IconButton>
            <MenuSurface bind:this={menu} anchorElement={anchor} anchorCorner="BOTTOM_RIGHT">
              <List>
                {#if docsUrl}
                  <Item on:SMUI:action={() => openUrl(docsUrl)}>
                    <Graphic class="material-icons">article</Graphic>
                    <Text>Docs</Text>
                  </Item>
                {/if}
                {#if latestExampleProjectUrl}
                  <Item on:SMUI:action={() => openUrl(latestExampleProjectUrl)}>
                    <Graphic class="material-icons">code</Graphic>
                    <Text>Latest Example Project or Code</Text>
                  </Item>
                {/if}
              </List>
            </MenuSurface>
          </div>
        {/if}
      </div>
    </CardContent>
  </Card>
</div>

<style>
  .container {
    padding: 2px;
  }
  .title {
    margin-top: 0px;
    margin-bottom: -5px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
  }
  .subtitle {
    margin-top: 8px;
    margin-bottom: 0px;
    text-wrap: wrap;
  }
  /* Fixes a weird issue with mdc-deprecated-list-item__secondary-text */
  .subtitle::before {
    display: none;
  }
  .card-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .left-side {
    display: flex;
    flex-direction: row;
    gap: 16px;
    align-items: center;
  }
</style>
