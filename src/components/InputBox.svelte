<!--
  @component
  
  A basic input box component.

  - The `on:submit` can be bound to for when the user presses the "Enter" key.

  Note that the `on:submit` event is not required if the InputBox is contained
  in a `form` element, as that automatically happens in that case. No event
  binding needed. The form will automatically trigger the on:click event of the
  nearest button.

  ### Implmenetation Notes

  There's also a global style added in the globalStyles folder for the text area
  to adjust it's min height.
-->
<script lang="ts">
  import Textfield from '@smui/textfield';
  import HelperText from '@smui/textfield/helper-text';
  import { createEventDispatcher } from 'svelte';

  export let disable: boolean = false;
  /**
   * The input type for the `InputBox`.
   */
  export let inputType = 'text';
  /**
   * Determines if the input is a text area instead of just a single line.
   */
  export let isTextArea = false;
  /**
   * This will show in the input box as a label when the text is empty,
   * and move to the top when the user starts typing.
   */
  export let label = 'Label';
  /**
   * The value of the input box when the user blurs the input. This also acts
   * as the initial value. It will only be updated when the user leaves the
   * input box.
   */
  export let onBlurValue: string = '';
  /**
   * The value of the `InputBox`. This will update automatically and can be
   * bound to. Alternatively, the onBlurValue can be bound to to only get
   * updates when the user blurs the input.
   */
  export let inputValue: string = onBlurValue;
  /**
   * If set, it will use the browser auto-complete features for the specified
   * label. For example `password`. If auto-complete is not desired, do not
   * set this.
   */
  export let autocompleteLabel: string | null = null;
  /**
   * The helper text to show below the input box. If null, no helper text will
   * be shown.
   */
  export let helperText: string | null = null;

  /**
   * Variant for when this is not a text area. If it is a text area, this will
   * be ignored.
   */
  export let variant: 'filled' | 'outlined' | 'standard' = 'standard';

  let previousOnBlurValue = onBlurValue;

  /**
   * Indicates if the input has been touched and edited. Might be useful
   * later.
   */
  let dirty = false;
  /**
   * Not currently being used. But could be used later.
   */
  let invalid = false;

  const dispatch = createEventDispatcher();

  function handleKeyDown(event: CustomEvent | KeyboardEvent) {
    event = event as KeyboardEvent;
    if (event.key === 'Enter' && !isTextArea) {
      onBlurValue = inputValue;
      dispatch('submit');
    }
  }

  function handleBlur() {
    onBlurValue = inputValue;
  }

  // Check if the onBlurValue is null or undefined and set it to an empty
  // string if it is. This fixes graphical issues with the input box.
  $: if (onBlurValue === null || onBlurValue === undefined) {
    onBlurValue = '';
    previousOnBlurValue = onBlurValue;
    inputValue = onBlurValue;
    // Detect when the onBlurValue is changed outside the component.
  } else if (onBlurValue !== previousOnBlurValue && onBlurValue !== inputValue) {
    inputValue = onBlurValue;
    previousOnBlurValue = onBlurValue;
  }
</script>

<Textfield
  type={inputType}
  bind:dirty
  bind:invalid
  bind:disabled={disable}
  bind:value={inputValue}
  input$autocomplete={autocompleteLabel}
  input$resizable={isTextArea ? false : undefined}
  input$rows={isTextArea ? inputValue.split(/\r\n|\r|\n/).length : undefined}
  textarea={isTextArea}
  variant={isTextArea ? undefined : variant}
  {label}
  on:keydown={handleKeyDown}
  on:blur={handleBlur}
>
  <svelte:fragment slot="helper">
    {#if helperText}
      <HelperText persistent>{helperText}</HelperText>
    {/if}
  </svelte:fragment>
</Textfield>

<style>
</style>
