<script lang="ts">
  import Confetti from './Confetti.svelte';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<Confetti />
{@render children?.()}
