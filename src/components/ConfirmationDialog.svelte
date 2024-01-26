<script lang="ts">
  import Button, { Label } from '@smui/button';
  import { Actions, Content, Title } from '@smui/dialog';
  import { createEventDispatcher } from 'svelte';
  import SmartDialog from './presentational/SmartDialog.svelte';

  export let open = false;
  export let title: string;
  export let message: string;
  export let confirmationButtonText = 'Yes';
  export let cancelButtonText = 'Cancel';

  const dispatch = createEventDispatcher();

  const handleConfirm = () => {
    open = false;
    dispatch('confirm');
  };

  const handleCancel = () => {
    open = false;
    dispatch('cancel');
  };
</script>

<SmartDialog bind:open>
  <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
  <Title>{title}</Title>
  <Content>{message}</Content>
  <Actions>
    <Button on:click={handleConfirm}>
      <Label>{confirmationButtonText}</Label>
    </Button>
    <Button on:click={handleCancel}>
      <Label>{cancelButtonText}</Label>
    </Button>
  </Actions>
</SmartDialog>
