<script lang="ts">
  import apiActivityService from '$services/ApiActivity.service.svelte';
  import SyncIndicator from './SyncIndicator.svelte';

  /**
   * Simulates a full sync cycle: Syncing -> Success -> Idle (after timeout).
   */
  function simulateSync() {
    apiActivityService.setSyncing();
    setTimeout(() => {
      apiActivityService.setSuccess();
    }, 1500);
  }

  /**
   * Simulates an API error: Syncing -> Error -> Idle (after timeout).
   */
  function simulateError() {
    apiActivityService.setSyncing();
    setTimeout(() => {
      apiActivityService.setError();
    }, 1500);
  }
</script>

<div class="example-container">
  <div class="indicator-row">
    <span class="label">Sync Indicator:</span>
    <SyncIndicator />
  </div>
  <div class="button-row">
    <button onclick={() => apiActivityService.setSyncing()}>Set Syncing</button>
    <button onclick={() => apiActivityService.setSuccess()}>Set Success</button>
    <button onclick={() => apiActivityService.setError()}>Set Error</button>
    <button onclick={() => apiActivityService.setIdle()}>Set Idle</button>
  </div>
  <div class="button-row">
    <button onclick={simulateSync}>Simulate Sync Cycle</button>
    <button onclick={simulateError}>Simulate Error Cycle</button>
  </div>
</div>

<style>
  .example-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .indicator-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .label {
    font-weight: 500;
  }

  .button-row {
    display: flex;
    gap: 8px;
  }

  button {
    padding: 6px 12px;
    border: 1px solid var(--mdc-theme-text-hint-on-background);
    border-radius: 4px;
    cursor: pointer;
    background: var(--bg-color-on-surface);
    color: var(--mdc-theme-on-surface);
  }

  button:hover {
    background: var(--mdc-theme-text-hint-on-background);
  }
</style>
