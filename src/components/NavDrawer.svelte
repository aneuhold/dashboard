<!--
  @component

  A navigation drawer that slides in from the left side of the screen.

  Documentation on SMUI's NavDrawer and possible options can be found [here](https://sveltematerialui.com/demo/drawer/).
-->
<script lang="ts">
  import Drawer, { Content } from '@smui/drawer';
  import List, { Item, Text, Graphic } from '@smui/list';
  import { clickOutside } from '../actions/clickOutside';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { navDrawerOpen } from '../stores/navDrawerOpen';
  import navInfo from '../util/navInfo';

  export let activeRoute: string = '/';

  function setRoute(newRoute: string) {
    $navDrawerOpen = false;
    goto(newRoute);
  }

  page.subscribe((pageData) => {
    if (pageData.route.id) {
      activeRoute = pageData.route.id;
    }
  });
</script>

<div
  use:clickOutside={() => {
    $navDrawerOpen = false;
  }}
>
  <Drawer variant="modal" bind:open={$navDrawerOpen}>
    <Content>
      <List>
        {#each Object.values(navInfo) as pageInfo}
          <Item on:click={() => setRoute(pageInfo.url)} activated={activeRoute === pageInfo.url}>
            {#if pageInfo.iconName}
              <Graphic class="material-icons" aria-hidden="true">
                {pageInfo.iconName}
              </Graphic>
            {/if}
            <Text>{pageInfo.shortTitle}</Text>
          </Item>
        {/each}

        <!-- <Separator /> -->
      </List>
    </Content>
  </Drawer>
</div>
