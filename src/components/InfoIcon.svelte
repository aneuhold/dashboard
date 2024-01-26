<!--
  An info icon that opens a dialog with the given title and content when clicked. 

  The content is passed as the default slot.

  ### Implementation Note

  This purposefully wasn't built as a tooltip because the UI is so dense in
  this application, that a tooltip could promote accidental clicking. Also
  the tooltip had some strange overflow issues. Those could have been resolved,
  but a Dialog seemed better.
-->
<script lang="ts">
  import Button, { Label } from '@smui/button';
  import { Actions, Content, Title } from '@smui/dialog';
  import IconButton, { Icon } from '@smui/icon-button';
  import SmartDialog from './presentational/SmartDialog.svelte';

  export let title: string;

  let open = false;
</script>

<IconButton
  on:click={() => {
    open = true;
  }}
  size="button"
>
  <Icon class="material-icons dimmed-color">help_outline</Icon>
</IconButton>

<SmartDialog bind:open>
  <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
  <Title>{title}</Title>
  <Content><slot /></Content>
  <Actions>
    <Button
      on:click={() => {
        open = false;
      }}
    >
      <Label>Cool!</Label>
    </Button>
  </Actions>
</SmartDialog>
