<!--
  @component

  An Architecture card that is made to look like a list item. The contents
  will be put into a dialog if contents are provided.

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
  import Dialog, { Title, Content as DialogContent, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';

  export let title: string;
  export let subtitle: string | null = null;
  export let docsUrl: string | null = null;
  export let latestExampleProjectUrl: string | null = null;
  export let iconComponent: ComponentType | null = null;

  function openUrl(url: string | null) {
    menu.setOpen(false);
    if (url) window.open(url, '_blank');
  }

  let menu: MenuSurface;
  let anchor: HTMLDivElement;
  let dialogOpen = false;
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
                {#if $$slots.default}
                  <Item
                    on:SMUI:action={() => {
                      menu.setOpen(false);
                      dialogOpen = true;
                    }}
                  >
                    <Graphic class="material-icons">info</Graphic>
                    <Text>Detailed Info</Text>
                  </Item>
                {/if}
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
<Dialog bind:open={dialogOpen} surface$style="width: 850px; max-width: calc(100vw - 32px);">
  <Title>
    <Icon class="material-icons"><svelte:component this={iconComponent} size={26} /></Icon>
    {title} Detailed Info
  </Title>
  <DialogContent>
    <slot />
  </DialogContent>
  <Actions>
    <Button action="accept">
      <Label>Done</Label>
    </Button>
  </Actions>
</Dialog>

<style>
  .container {
    padding: 2px;
  }
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
