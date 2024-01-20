<script lang="ts">
  import Button, { Icon } from '@smui/button';
  import { createEventDispatcher } from 'svelte';

  export let variant: 'outlined' | 'raised' | undefined = undefined;
  export let disabled: boolean = false;
  export let color: 'primary' | 'secondary' = 'primary';
  export let iconName: string;

  const dispatch = createEventDispatcher();
</script>

<div>
  <Button
    {variant}
    {color}
    class="squareIconButton"
    on:click={() => {
      dispatch('click');
    }}
    {disabled}
  >
    <Icon class="material-icons squareIconButtonIcon">{iconName}</Icon>
  </Button>
</div>

<style>
  * :global(.squareIconButtonIcon) {
    margin: 0px;
  }

  * :global(.squareIconButton) {
    min-width: 42px;
  }
</style>
