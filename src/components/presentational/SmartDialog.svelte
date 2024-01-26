<!--
  @component
  
  A component that wraps a normal Dialog component. Currently, it resolves
  an issue where the screen isn't scrollable if the back button is pressed
  while a dialog is open.
-->
<script lang="ts">
  import Dialog from '@smui/dialog';
  import { onMount } from 'svelte';

  export let open = false;

  function closeDialog() {
    open = false;
  }

  onMount(() => {
    window.addEventListener('popstate', closeDialog);
    return () => {
      window.removeEventListener('popstate', closeDialog);
    };
  });
</script>

<Dialog bind:open>
  <slot />
</Dialog>
