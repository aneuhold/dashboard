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
  import InputBox from '$components/presentational/InputBox.svelte';
  import Checkbox from '@smui/checkbox';

  $: item = $currentItemId ? NonogramKatanaItemMapService.getItemStore($currentItemId) : null;
  $: displayInfo = $item ? nonogramKatanaItemDisplayInfo[$item.itemName] : null;
  $: minDesiredPresent = $item && $item.minDesired !== undefined && $item.minDesired !== null;
  $: maxDesiredPresent = $item && $item.maxDesired !== undefined && $item.maxDesired !== null;
  $: storageCapPresent = $item && $item.storageCap !== undefined && $item.storageCap !== null;
</script>

<SmartDialog bind:open={$open}>
  {#if $item && displayInfo}
    <Title>Update "{displayInfo.displayName}"</Title>
    <Content>
      <div class="content">
        <Checkbox
          checked={minDesiredPresent}
          on:click={() => {
            if ($item && minDesiredPresent) {
              $item.minDesired = undefined;
            } else if ($item) {
              $item.minDesired = 0;
            }
          }}
        />
        {#if minDesiredPresent}
          <InputBox
            bind:onBlurValue={$item.minDesired}
            inputType="number"
            min={0}
            max={$item.storageCap}
            label="Min Desired"
          />
        {:else}
          <i class="mdc-typography--body1 dimmed-color">Min desired</i>
        {/if}
        <Checkbox
          checked={maxDesiredPresent}
          on:click={() => {
            if ($item && maxDesiredPresent) {
              $item.maxDesired = undefined;
            } else if ($item) {
              $item.maxDesired = $item.storageCap ?? 400;
            }
          }}
        />
        {#if maxDesiredPresent}
          <InputBox
            bind:onBlurValue={$item.maxDesired}
            inputType="number"
            min={$item.minDesired ?? 0}
            max={$item.storageCap}
            label="Max Desired"
          />
        {:else}
          <i class="mdc-typography--body1 dimmed-color">Max desired</i>
        {/if}
        <Checkbox
          checked={storageCapPresent}
          on:click={() => {
            if ($item && storageCapPresent) {
              $item.storageCap = undefined;
            } else if ($item) {
              $item.storageCap = $item.maxDesired ?? 400;
            }
          }}
        />
        {#if storageCapPresent}
          <InputBox
            bind:onBlurValue={$item.storageCap}
            inputType="number"
            min={1}
            label="Storage Cap"
          />
        {:else}
          <i class="mdc-typography--body1 dimmed-color">Storage cap</i>
        {/if}
      </div>
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
    display: grid;
    grid-template-columns: min-content 1fr;
    align-items: center;
  }
</style>
