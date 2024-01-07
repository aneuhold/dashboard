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
  import { createEventDispatcher, tick } from 'svelte';

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
   * Variant for when this is not a text area. If it is a text area, this will
   * be ignored.
   */
  export let variant: 'filled' | 'outlined' | 'standard' = 'standard';

  let previousOnBlurValue = onBlurValue;

  let focused = false;
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
      focused = false;
      onBlurValue = inputValue;
      dispatch('submit');
    }
  }

  function handleBlur() {
    focused = false;
    onBlurValue = inputValue;
  }

  $: {
    // Detect when the onBlurValue is changed outside the component.
    if (onBlurValue !== previousOnBlurValue && onBlurValue !== inputValue) {
      // Use tick so that the SMUI component updates correctly when it goes
      // from having characters to not having characters.
      // This still needs to be fixed up a bit.
      tick().then(() => {
        inputValue = onBlurValue;
        previousOnBlurValue = onBlurValue;
        focused = false;
      });
    }
  }
</script>

<Textfield
  type={inputType}
  bind:dirty
  bind:invalid
  bind:disable
  bind:focused
  bind:value={inputValue}
  input$autocomplete={autocompleteLabel}
  textarea={isTextArea}
  variant={isTextArea ? undefined : variant}
  {label}
  on:keydown={handleKeyDown}
  on:focus={() => (focused = true)}
  on:blur={handleBlur}
/>

<style>
</style>
