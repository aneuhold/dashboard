<script lang="ts" context="module">
  export type ClickEvent = MouseEvent & {
    currentTarget: EventTarget & HTMLDivElement;
  };
</script>

<!--
  @component
  
  A div that is clickable. It is setup to be accessible.
-->
<script lang="ts">
  export let clickAction: (event?: ClickEvent) => void;
</script>

<div
  on:click={(event) => {
    clickAction(event);
  }}
  role="button"
  tabindex="0"
  on:keypress={() => {
    clickAction();
  }}
>
  <slot />
</div>

<style>
  div {
    cursor: pointer;
    /* The below styles will likely need to be changed */
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
