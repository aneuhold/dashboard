<script lang="ts">
  import Confetti from './Confetti.svelte';

  export let numButtons = 1;

  $: confettiButtonInfo = Array(numButtons)
    .fill(null)
    .map(() => ({
      showConfetti: false
    }));

  $: {
    console.log(confettiButtonInfo);
  }
</script>

<div class="exampleContainer">
  {#each confettiButtonInfo as confettiInfo}
    <div class="confettiContainer">
      <Confetti bind:show={confettiInfo.showConfetti} />
      <button
        class="exampleConfettiButton"
        on:click={() => {
          confettiInfo.showConfetti = true;
        }}
      >
        Click me
      </button>
    </div>
  {/each}
</div>

<style>
  .exampleContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .exampleConfettiButton {
    margin: auto;
  }
</style>
