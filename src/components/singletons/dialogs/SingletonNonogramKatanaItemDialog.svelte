<!--
  @component
  
  This component is a singleton, and should only ever be used once. Use the
  exported functions to show the dialog.
-->
<script lang="ts" context="module">
  import SmartDialog from '$components/presentational/SmartDialog.svelte';
  import Button, { Label } from '@smui/button';
  import { Actions, Content, Title } from '@smui/dialog';
  import { writable } from 'svelte/store';
  import { nonogramKatanaItemDisplayInfo } from '../../../routes/entertainment/nonogramkatana/items/+page.svelte';
  import { NonogramKatanaItemMapService } from '../../../services/NonogramKatana/NonogramKatanaItemMapService';

  /**
   * A Nonogram Katana item dialog which can be used anywhere in the app.
   */
  export const nonogramKatanaItemDialog = {
    open: (itemId: string) => {
      currentItemId.set(itemId);
      open.set(true);
    }
  };

  const currentItemId = writable<string | null>(null);
  const open = writable(false);
</script>

<script lang="ts">
  $: item = $currentItemId ? NonogramKatanaItemMapService.getItemStore($currentItemId) : null;
  $: displayInfo = $item ? nonogramKatanaItemDisplayInfo[$item.itemName] : null;
</script>

<SmartDialog bind:open={$open}>
  {#if $item && displayInfo}
    <Title>Update "{displayInfo.displayName}"</Title>
    <Content>
      <div class="content">Some things here</div>
    </Content>
    <Actions>
      <Button
        on:click={() => {
          $open = false;
        }}
      >
        <Label>Done</Label>
      </Button>
    </Actions>
  {/if}
</SmartDialog>

<style>
  .content {
    display: flex;
    flex-direction: column;
  }
</style>
