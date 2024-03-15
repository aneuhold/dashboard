<script lang="ts" context="module">
  export type BreadCrumbArray = Array<{
    name: string;
    /**
     * The link to the route, this should not include the first slash.
     */
    link: string;
  }>;
</script>

<script lang="ts">
  import { page } from '$app/stores';

  export let breadCrumbArray: BreadCrumbArray | null = null;

  let activeRoute: string = '/';
  let previousLink: string | undefined;
  $: routeArray = breadCrumbArray
    ? breadCrumbArray
    : activeRoute
        .split('/')
        .filter((route) => route !== '')
        .map((route) => {
          const routeLink = previousLink ? previousLink + '/' + route : route;
          previousLink = routeLink;
          return { name: route, link: routeLink };
        });

  page.subscribe((pageData) => {
    if (pageData.route.id) {
      activeRoute = pageData.route.id;
    }
  });
</script>

<span class="breadcrumb-container">
  {#if routeArray.length === 0}
    <span>home</span>
  {:else}
    <a href="/">home</a>
    <span>/</span>
  {/if}
  {#each routeArray as route, index}
    {#if index > 0}
      <span>/</span>
    {/if}
    {#if index === routeArray.length - 1}
      <span>{route.name}</span>
    {:else}
      <a href="/{route.link}">{route.name}</a>
    {/if}
  {/each}
</span>

<style>
  .breadcrumb-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-left: 8px;
    & > a {
      text-decoration: none;
      color: var(--mdc-theme-primary);
      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>
