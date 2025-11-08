<script lang="ts" module>
  export type ClickEvent = MouseEvent & {
    currentTarget: EventTarget & HTMLDivElement;
  };
</script>

<!--
  @component
  
  A div that is clickable. It is setup to be accessible.
-->
<script lang="ts">
  interface Props {
    clickAction: (event?: ClickEvent) => void;
    children?: import('svelte').Snippet;
  }

  let { clickAction, children }: Props = $props();
</script>

<div
  onclick={(event) => {
    clickAction(event);
  }}
  role="button"
  tabindex="0"
  onkeypress={() => {
    clickAction();
  }}
>
  {@render children?.()}
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
