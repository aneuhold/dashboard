<!--
  @component

  An Architecture card that is made to look like a list item.

  Implementation notes:

  It had to be made to be a card instead of a list item because of clashing
  in styles when using the menu component.
-->
<script lang="ts">
  import List, { Graphic, Item, Text } from '@smui/list';
  import Card, { Content } from '@smui/card';
  import type { ComponentType } from 'svelte';
  import MenuSurface from '@smui/menu-surface';
  import IconButton, { Icon } from '@smui/icon-button';

  export let title: string;
  export let subtitle: string | null = null;
  export let docsUrl: string | null = null;
  export let latestExampleProjectUrl: string | null = null;
  export let iconComponent: ComponentType | null = null;

  function openUrl(url: string | null) {
    if (url) window.open(url, '_blank');
  }

  let menu: MenuSurface;
  let anchor: HTMLDivElement;
</script>

<div>
  <Card>
    <Content>
      <div class="card-content">
        <div class="left-side">
          {#if iconComponent}
            <Icon class="material-icons"><svelte:component this={iconComponent} size={30} /></Icon>
          {/if}
          <div>
            <h4 class="mdc-typography--body1 title">{title}</h4>
            {#if subtitle}
              <span class="mdc-deprecated-list-item__secondary-text subtitle">{subtitle}</span>
            {/if}
          </div>
        </div>
        {#if docsUrl || latestExampleProjectUrl}
          <div bind:this={anchor}>
            <IconButton class="material-icons dimmed-color" on:click={() => menu.setOpen(true)}
              >menu</IconButton
            >
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
    </Content>
  </Card>
</div>

<style>
  .title {
    margin-top: 0px;
    margin-bottom: -5px;
  }
  .subtitle {
    margin-top: 0px;
    margin-bottom: 0px;
    text-wrap: wrap;
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
