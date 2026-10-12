<!--
  @component

  A small sync indicator that shows the current API activity state.
  Displays a spinner while syncing, a checkmark on success, an error icon on
  failure, a crossed-out cloud while offline, and a cloud while changes wait
  to be sent. Hidden when idle.
-->
<script lang="ts">
  import CircularProgress from '@smui/circular-progress';
  import { Icon } from '@smui/icon-button';
  import { fade } from 'svelte/transition';
  import apiActivityService, { ApiActivityState } from '$services/ApiActivity.service.svelte';
</script>

<div class="sync-indicator" class:visible={apiActivityService.state !== ApiActivityState.Idle}>
  {#if apiActivityService.state === ApiActivityState.Syncing}
    <div transition:fade={{ duration: 500 }}>
      <CircularProgress style="height: 24px; width: 24px" class="on-primary" indeterminate={true} />
    </div>
  {:else if apiActivityService.state === ApiActivityState.Success}
    <div transition:fade={{ duration: 500 }}>
      <Icon class="material-icons">check_circle</Icon>
    </div>
  {:else if apiActivityService.state === ApiActivityState.Error}
    <div transition:fade={{ duration: 500 }}>
      <Icon class="material-icons">error</Icon>
    </div>
  {:else if apiActivityService.state === ApiActivityState.Offline}
    <div transition:fade={{ duration: 500 }}>
      <Icon class="material-icons">cloud_off</Icon>
    </div>
  {:else if apiActivityService.state === ApiActivityState.Pending}
    <div transition:fade={{ duration: 500 }}>
      <Icon class="material-icons">cloud_queue</Icon>
    </div>
  {/if}
</div>

<style>
  .sync-indicator {
    display: grid;
    place-items: center;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    pointer-events: none;
  }

  .sync-indicator > :global(*) {
    grid-area: 1 / 1;
    display: flex;
    align-items: center;
  }

  .sync-indicator.visible {
    opacity: 1;
  }

  .sync-indicator :global(.material-icons) {
    color: var(--mdc-theme-on-primary);
  }
</style>
