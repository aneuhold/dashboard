<script lang="ts">
  import Textfield from '@smui/textfield';
  import Icon from '@smui/textfield/icon';
  import HelperText from '@smui/textfield/helper-text';
  import { createEventDispatcher } from 'svelte';

  /**
   * The input type for the `InputBox`.
   */
  export let inputType = 'text';
  export let label = 'Label';
  /**
   * The value of the `InputBox`. This will update automatically and can be
   * bound to.
   */
  export let inputValue: string = '';
  export let validationMessage: string = '';
  export let disable: boolean = false;

  let focused = false;
  let dirty = false;
  let invalid = false;
  $: disabled = focused || !inputValue || !dirty || invalid || disable;

  const dispatch = createEventDispatcher();

  function handleSubmit() {
    dispatch('submit');
  }
</script>

<div class="app">
  <Textfield
    type={inputType}
    bind:dirty
    bind:invalid
    updateInvalid
    bind:value={inputValue}
    {label}
    style="min-width: 250px;"
    on:focus={() => (focused = true)}
    on:blur={() => (focused = false)}
    withTrailingIcon={!disabled}
  >
    <!--
    Since this icon is conditional, it needs to be wrapped
    in a fragment, and we need to provide withTrailingIcon.
  -->
    <svelte:fragment slot="trailingIcon">
      {#if !disabled}
        <Icon class="material-icons" role="button" on:click={handleSubmit}>send</Icon>
      {/if}
    </svelte:fragment>
    <HelperText validationMsg slot="helper">{validationMessage}</HelperText>
  </Textfield>
</div>

<style>
</style>
