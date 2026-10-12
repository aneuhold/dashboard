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
  import SingletonConfirmationDialog from '$components/singletons/dialogs/SingletonConfirmationDialog/SingletonConfirmationDialog.svelte';
  import SingletonTaskAssignmentDialog from '$components/singletons/dialogs/SingletonTaskAssignmentDialog/SingletonTaskAssignmentDialog.svelte';
  import SingletonTaskSharingDialog from '$components/singletons/dialogs/SingletonTaskSharingDialog/SingletonTaskSharingDialog.svelte';
  import SingletonSnackbar from '$components/singletons/SingletonSnackbar.svelte';
  import apiResponseHandlingOrder from '$services/DashboardAPIService/apiResponseHandlingOrder';
  import DashboardAPIService from '$services/DashboardAPIService/DashboardAPI.service';
  import nonogramKatanaItemMapService from '$services/NonogramKatana/NonogramKatanaItemMap.service';
  import nonogramKatanaUpgradeMapService from '$services/NonogramKatana/NonogramKatanaUpgradeMap.service';
  import taskMapService from '$services/Task/TaskMap/TaskMap.service';
  import { appIsVisible } from '$stores/session/appIsVisible';
  import { LoginState, loginState } from '$stores/session/loginState';
  import LocalData from '$util/LocalData/LocalData';
  import Login from '../components/Login/Login.svelte';
  import NavBar from '../components/NavBar.svelte';

  let { children }: { children?: Snippet } = $props();

  let mounted = $state(false);

  onMount(() => {
    DashboardAPIService.setApiOutputHandlers(apiResponseHandlingOrder);
    // Initialize services from LocalData. Not sure if this is the best place, but it does solve
    // the loop issue where services depend upon each other and LocalData needs to be loaded first.
    if (LocalData.nonogramKatanaItemMap) {
      nonogramKatanaItemMapService.setMap(LocalData.nonogramKatanaItemMap);
    }
    if (LocalData.nonogramKatanaUpgradeMap) {
      nonogramKatanaUpgradeMapService.setMap(LocalData.nonogramKatanaUpgradeMap);
    }
    if (LocalData.taskMap) {
      taskMapService.setMap(LocalData.taskMap);
    }
    // Without this, the layout fluctuates a lot when the page is starting up.
    mounted = true;
  });

  const handleVisibilityChange = () => {
    appIsVisible.set(document.visibilityState === 'visible');
  };

  const handleOnline = () => {
    DashboardAPIService.skipWaitsAndProcessRequestsNow();
  };

  // Global app visibility and network listeners
  if (browser) {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
  }

  onDestroy(() => {
    if (browser) {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
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
    margin-bottom: 80px;
  }
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
</style>
