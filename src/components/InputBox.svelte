<!--
  @component
  
  A basic input box component.

  - The `on:submit` can be bound to for when the user presses the "Enter" key.
  - The `on:blur` can be bound to for when the user leaves the input box.

  Note that the `on:submit` event is not required if the InputBox is contained
  in a `form` element, as that automatically happens in that case. No event
  binding needed. The form will automatically trigger the on:click event of the
  nearest button.
-->
<script lang="ts">
  import Textfield from '@smui/textfield';
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
  export let variant: 'filled' | 'outlined' | 'standard' = 'standard';

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
  style={`min-width: 250px;${isTextArea ? 'min-height:5lh;' : ''}}`}
  on:keydown={handleKeyDown}
  on:focus={() => (focused = true)}
  on:blur={handleBlur}
/>
