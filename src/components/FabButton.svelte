<!--
  @component
  
  A FAB Button that will be put at the bottom right of the screen
-->
<script lang="ts">
  import Fab, { Icon } from '@smui/fab';

  export let clickHandler: () => void;
  export let iconName: string;
</script>

<div class="fabButton">
  <Fab color="primary" on:click={clickHandler}>
    <Icon class="material-icons">{iconName}</Icon>
  </Fab>
</div>

<style>
  .fabButton {
    position: fixed;
    bottom: 32px;
    right: 32px;
  }
</style>
