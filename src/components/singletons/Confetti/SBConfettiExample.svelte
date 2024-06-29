<script lang="ts">
  import Confetti, { triggerConfetti } from './Confetti.svelte';

  export let numButtons = 1;

  $: confettiButtonInfo = Array(numButtons).fill(null);
</script>

<div class="exampleContainer">
  <Confetti />
  {#each confettiButtonInfo as _}
    <button
      class="exampleConfettiButton"
      on:click={(event) => {
        triggerConfetti(event.clientX, event.clientY);
      }}
    >
      Click me
    </button>
  {/each}
</div>

<style>
  .exampleContainer {
    display: flex;
    flex-direction: column;
  }
  .exampleConfettiButton {
    margin: auto;
  }
</style>
