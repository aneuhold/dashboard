<!--
  @component
  
  A div that is clickable. It is setup to be accessible.
-->
<script lang="ts">
  export let clickAction: () => void;
</script>

<div on:click={clickAction} role="button" tabindex="0" on:keypress={clickAction}>
  <slot />
</div>

<style>
  div {
    cursor: pointer;
  }
</style>
