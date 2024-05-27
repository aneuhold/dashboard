<script lang="ts">
  import { confetti } from '@neoconfetti/svelte';
  import { createEventDispatcher } from 'svelte';
  import { userSettings } from '$stores/userSettings';

  /**
   * Determines if the confetti should be shown. This should be bound to because
   * it resets after the {@link durationMs} back to false.
   */
  export let show = false;
  export let durationMs = 3000;

  $: confettiEnabled = $userSettings.config.enabledFeatures.useConfettiForTasks;
  $: showConfetti = show && confettiEnabled;

  let currentTimeout: NodeJS.Timeout | undefined = undefined;

  const dispatch = createEventDispatcher();

  $: if (show && confettiEnabled) {
    if (currentTimeout) clearTimeout(currentTimeout);
    currentTimeout = setTimeout(() => {
      show = false;
      dispatch('confettiComplete');
    }, durationMs);
  }
</script>

{#if showConfetti}
  <div class="confettiContainer" use:confetti></div>
{/if}

<style>
  .confettiContainer {
    position: fixed;
  }
</style>
