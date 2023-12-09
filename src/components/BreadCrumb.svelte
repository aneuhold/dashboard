<script lang="ts">
  import { page } from '$app/stores';

  let activeRoute: string = '/';
  $: routeArray = activeRoute.split('/').filter((route) => route !== '');

  page.subscribe((pageData) => {
    if (pageData.route.id) {
      activeRoute = pageData.route.id;
    }
  });
</script>

<span class="breadcrumb-container">
  {#each routeArray as route, index}
    {#if index > 0}
      <span>/</span>
    {/if}
    {#if index === routeArray.length - 1}
      <span>{route}</span>
    {:else}
      <a href="/{route}">{route}</a>
    {/if}
  {/each}
</span>

<style>
  .breadcrumb-container {
    display: flex;
    flex-direction: row;
    align-items: center;
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
