<!--
  @component
  
  The root of the application.
-->
<script lang="ts">
  import Confetti from '$components/singletons/Confetti/Confetti.svelte';
  import SingletonSnackbar from '$components/singletons/SingletonSnackbar.svelte';
  import SingletonConfirmationDialog from '$components/singletons/dialogs/SingletonConfirmationDialog.svelte';
  import SingletonTaskAssignmentDialog from '$components/singletons/dialogs/SingletonTaskAssignmentDialog/SingletonTaskAssignmentDialog.svelte';
  import SingletonTaskSharingDialog from '$components/singletons/dialogs/SingletonTaskSharingDialog/SingletonTaskSharingDialog.svelte';
  import LocalData from '$util/LocalData/LocalData';
  import localOverride from '$util/localOverride';
  import CircularProgress from '@smui/circular-progress';
  import { onDestroy, onMount } from 'svelte';
  import Login from '../components/Login/Login.svelte';
  import NavBar from '../components/NavBar.svelte';
  import '../globalStyles/global.css';
  import { appIsVisible } from '../stores/appIsVisible';
  import { LoginState, loginState } from '../stores/loginState';

  let mounted = false;

  // Top-level initialization of local data. This should only be done here.
  LocalData.initialize();

  // Override if wanted for local development
  localOverride();

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
      <Confetti />
      <NavBar>
        <div class="content">
          <slot />
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
