<script lang="ts" module>
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

  let {
    menuItems,
    alignCenterVertically = false
  }: {
    menuItems: MenuButtonItem[];
    alignCenterVertically?: boolean;
  } = $props();

  function handleItemClick(clickAction: () => void) {
    if (menu) {
      menu.setOpen(false);
    }
    // Wait for the ripple to stop, this also prevents an error for events
    // from SMUI if the component was deleted during the clickAction.
    setTimeout(clickAction, 50);
  }

  let menu: MenuSurface | undefined = $state();
  let anchor: HTMLDivElement | undefined = $state();
</script>

<!--The extra div is required to keep the bounds of the menu contained -->
<div class={alignCenterVertically ? 'alignCenter' : ''}>
  <div bind:this={anchor}>
    <IconButton class="material-icons dimmed-color" onclick={() => menu?.setOpen(true)}>
      menu
    </IconButton>
    <MenuSurface bind:this={menu} anchorElement={anchor} anchorCorner="BOTTOM_RIGHT">
      <List>
        {#each menuItems as item (item.title)}
          <Item
            onclick={() => {
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

<style>
  .alignCenter {
    display: flex;
    align-items: center;
  }
</style>
