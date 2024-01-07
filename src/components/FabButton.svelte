<!--
  @component
  
  A FAB Button that will be put at the bottom right of the screen
-->
<script lang="ts">
  import Fab, { Icon, Label } from '@smui/fab';

  export let clickHandler: () => void;
  export let iconName: string;
  export let label: string | null = null;
</script>

<div class="fabButton">
  <Fab color="primary" on:click={clickHandler} extended={!!label}>
    <Icon class="material-icons">{iconName}</Icon>
    {#if label}
      <Label>{label}</Label>
    {/if}
  </Fab>
</div>

<style>
  .fabButton {
    position: fixed;
    bottom: 32px;
    right: 32px;
  }
</style>
