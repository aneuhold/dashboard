<!--
  @component
  
  The root of the application.
-->
<script lang="ts">
  import '../globalStyles/global.css';
  import CircularProgress from '@smui/circular-progress';
  import { onDestroy, onMount, type Snippet } from 'svelte';
  import { browser } from '$app/environment';
  import Confetti from '$components/singletons/Confetti/Confetti.svelte';
  import SingletonConfirmationDialog from '$components/singletons/dialogs/SingletonConfirmationDialog.svelte';
  import SingletonTaskAssignmentDialog from '$components/singletons/dialogs/SingletonTaskAssignmentDialog/SingletonTaskAssignmentDialog.svelte';
  import SingletonTaskSharingDialog from '$components/singletons/dialogs/SingletonTaskSharingDialog/SingletonTaskSharingDialog.svelte';
  import SingletonSnackbar from '$components/singletons/SingletonSnackbar.svelte';
  import { appIsVisible } from '$stores/session/appIsVisible';
  import { LoginState, loginState } from '$stores/session/loginState';
  import Login from '../components/Login/Login.svelte';
  import NavBar from '../components/NavBar.svelte';
  let { children }: { children?: Snippet } = $props();

  let mounted = $state(false);

  // Without this, the layout fluctuates a lot when the page is starting up.
  onMount(() => {
    mounted = true;
  });

  const handleVisibilityChange = () => {
    appIsVisible.set(document.visibilityState === 'visible');
  };

  // Global app visibility change listener
  if (browser) {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  onDestroy(() => {
    if (browser) {
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
      <Confetti />
      <NavBar>
        <div class="content">
          {@render children?.()}
        </div>
      </NavBar>
      <!-- Singleton Components -->
      <SingletonSnackbar />
      <SingletonConfirmationDialog />
      <SingletonTaskSharingDialog />
      <SingletonTaskAssignmentDialog />
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
