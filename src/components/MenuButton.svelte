<script lang="ts" context="module">
  export type MenuButtonItem = {
    title: string;
    iconName: string;
    clickAction: () => void;
  };
</script>

<!--
  @component
  
  A button that opens a menu with a list of items. This cannot be contained
  within an SMUI List, as it will cause the menu to be misaligned.
-->
<script lang="ts">
  import IconButton from '@smui/icon-button';
  import List, { Graphic, Item, Text } from '@smui/list';
  import MenuSurface from '@smui/menu-surface';

  export let menuItems: MenuButtonItem[];

  function handleItemClick(clickAction: () => void) {
    menu.setOpen(false);
    clickAction();
  }

  let menu: MenuSurface;
  let anchor: HTMLDivElement;
</script>

<!--The extra div is required to keep the bounds of the menu contained -->
<div>
  <div bind:this={anchor}>
    <IconButton class="material-icons dimmed-color" on:click={() => menu.setOpen(true)}>
      menu
    </IconButton>
    <MenuSurface bind:this={menu} anchorElement={anchor} anchorCorner="BOTTOM_RIGHT">
      <List>
        {#each menuItems as item}
          <Item
            on:SMUI:action={() => {
              handleItemClick(item.clickAction);
            }}
          >
            <Graphic class="material-icons">{item.iconName}</Graphic>
            <Text>{item.title}</Text>
          </Item>
        {/each}
      </List>
    </MenuSurface>
  </div>
</div>
