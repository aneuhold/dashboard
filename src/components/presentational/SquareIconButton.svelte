<script lang="ts">
  import Button, { Icon } from '@smui/button';
  import { createEventDispatcher } from 'svelte';

  interface Props {
    variant?: 'outlined' | 'raised' | undefined;
    disabled?: boolean;
    color?: 'primary' | 'secondary';
    iconName: string;
  }

  let {
    variant = undefined,
    disabled = false,
    color = 'primary',
    iconName
  }: Props = $props();

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
