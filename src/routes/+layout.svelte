<!--
  @component
  
  The root of the application.
-->
<script lang="ts">
  import CircularProgress from '@smui/circular-progress';
  import Snackbar from 'components/Snackbar.svelte';
  import SingletonConfirmationDialog from 'components/singletons/dialogs/SingletonConfirmationDialog.svelte';
  import { onDestroy, onMount } from 'svelte';
  import LocalData from 'util/LocalData';
  import Login from '../components/Login.svelte';
  import NavBar from '../components/NavBar.svelte';
  import '../globalStyles/global.css';
  import { appIsVisible } from '../stores/appIsVisible';
  import { LoginState, loginState } from '../stores/loginState';

  let mounted = false;

  // Top-level initialization of local data. This should only be done here.
  LocalData.initialize();

  // Without this, the layout fluctuates a lot when the page is starting up.
  onMount(() => {
    mounted = true;
  });

  const handleVisibilityChange = () => {
    appIsVisible.set(document.visibilityState === 'visible');
  };

  // Global app visibility change listener
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  });
</script>

<div class="app">
  {#if !mounted || $loginState === LoginState.Initializing}
    <div class="loading">
      <CircularProgress style="height: 32px; width: 32px;" indeterminate={true} />
    </div>
  {:else if $loginState === LoginState.ProcessingCredentials || $loginState === LoginState.LoggedOut}
    <Login />
  {:else}
    <main>
      <NavBar>
        <div class="content">
          <slot />
        </div>
      </NavBar>
      <!-- Singleton Components -->
      <Snackbar />
      <SingletonConfirmationDialog />
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
