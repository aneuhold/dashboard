<script lang="ts">
  import Drawer, { Content, Header, Subtitle } from '@smui/drawer';
  import List, { Item, Text, Graphic } from '@smui/list';
  import { clickOutside } from '../actions/clickOutside';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Title } from '@smui/top-app-bar';
  import { navDrawerOpen } from '../stores/navDrawerOpen';

  export let activeRoute: RoutePath | '/' = '/';

  type RouteInfo = {
    title: string;
    icon: string;
  };

  /**
   * Details on each route that should show up in the NavDrawer.
   *
   * Icons can be found here: https://fonts.google.com/icons
   */
  const routesInfo = {
    '/dev': {
      title: 'Development',
      icon: 'code'
    }
  } satisfies Record<string, RouteInfo>;
  // This type stuff is a bit complicated, but can be refactored if more
  // specificity is wanted with the layout of the NavDrawer.
  type RoutePath = keyof typeof routesInfo;
  const routePaths = Object.keys(routesInfo) as Array<RoutePath>;

  function setRoute(newRoute: RoutePath) {
    $navDrawerOpen = false;
    goto(newRoute);
  }

  page.subscribe((pageData) => {
    activeRoute = pageData.route.id as RoutePath;
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
        {#each routePaths as routePath}
          <Item on:click={() => setRoute(routePath)} activated={activeRoute === routePath}>
            <Graphic class="material-icons" aria-hidden="true">
              {routesInfo[routePath].icon}
            </Graphic>
            <Text>{routesInfo[routePath].title}</Text>
          </Item>
        {/each}

        <!-- <Separator /> -->
      </List>
    </Content>
  </Drawer>
</div>
