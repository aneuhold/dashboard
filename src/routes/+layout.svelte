<!--
  @component
  
  The root of the application.
-->
<script lang="ts">
  import CircularProgress from '@smui/circular-progress';
  import LocalData from 'util/LocalData';
  import Login from '../components/Login/Login.svelte';
  import NavBar from '../components/NavBar.svelte';
  import '../globalStyles/global.css';
  import { localDataReady } from '../stores/localDataReady';
  import { LoginState, loginState } from '../stores/loginState';

  let navBar: NavBar;

  // Top-level initialization of local data. This should only be done here.
  LocalData.initialize().then(() => {
    localDataReady.set(true);
  });
</script>

<div class="app">
  {#if !$localDataReady}
    <div class="loading">
      <CircularProgress style="height: 32px; width: 32px;" indeterminate={true} />
    </div>
  {:else if $loginState !== LoginState.LoggedIn}
    <Login />
  {:else}
    <main>
      <NavBar bind:this={navBar}>
        <div class="content">
          <slot />
        </div>
      </NavBar>
    </main>
  {/if}
</div>

<style>
  .content {
    padding: 1rem;
  }
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
</style>
