<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Unsubscriber } from 'svelte/store';
  import NavBar from '../components/NavBar.svelte';
  import '../globalStyles/global.css';
  import { apiKey } from '../stores/apiKey';
  import Login from './Login.svelte';

  let navBar: NavBar;

  let apiKeyExists = false;

  const unsubscribers: Array<Unsubscriber> = [];
  unsubscribers.push(
    apiKey.subscribe((updatedApiKey) => {
      if (updatedApiKey) {
        apiKeyExists = true;
      } else {
        apiKeyExists = false;
      }
    })
  );

  onDestroy(() => {
    unsubscribers.forEach((unsubscriber) => {
      unsubscriber();
    });
  });
</script>

<div class="app">
  {#if apiKeyExists}
    <main>
      <NavBar bind:this={navBar}>
        <div class="content">
          <slot />
        </div>
      </NavBar>
    </main>
  {:else}
    <Login />
  {/if}
</div>

<style>
  .content {
    padding: 1rem;
  }
</style>
