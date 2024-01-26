<!--
  @component
  
  This component is a singleton, and should only ever be used once. Use the
  exported functions to show the dialog.
-->
<script lang="ts" context="module">
  import Button, { Label } from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import { Actions, Content, Title } from '@smui/dialog';
  import FormField from '@smui/form-field';
  import type { ObjectId } from 'bson';
  import SmartDialog from 'components/presentational/SmartDialog.svelte';
  import { writable } from 'svelte/store';
  import { TaskMapService } from '../../../services/Task/TaskMapService';
  import { userSettings } from '../../../stores/userSettings';

  /**
   * A task sharing dialog which can be used anywhere in the app.
   */
  export const taskSharingDialog = {
    open: (taskId: string) => {
      currentTaskId.set(taskId);
      open.set(true);
    }
  };

  const currentTaskId = writable<string | null>(null);
  const open = writable(false);
</script>

<script lang="ts">
  $: task = $currentTaskId ? TaskMapService.getTaskStore($currentTaskId) : null;
  $: sharedWithIds = $task ? $task.sharedWith.map((id) => id.toString()) : [];
  $: collaborators = $userSettings.collaborators;

  function toggleSharedWith(id: ObjectId) {
    if (!$task) return;
    if (sharedWithIds.includes(id.toString())) {
      $task.sharedWith = $task.sharedWith.filter((sharedWithId) => {
        return sharedWithId.toString() !== id.toString();
      });
    } else {
      $task.sharedWith.push(id);
      $task.sharedWith = $task.sharedWith;
    }
  }
</script>

<SmartDialog bind:open={$open}>
  {#if $task}
    <Title>Share "{$task.title}"</Title>
    <Content>
      <div class="content">
        {#if Object.values(collaborators).length === 0}
          <i class="mdc-typography--body1 dimmed-color">No collaborators</i>
          <a href="/settings">Add one in settings here!</a>
        {:else}
          <p>Note that sharing automatically applies to all sub-tasks if enabled.</p>
          {#each Object.values(collaborators) as collaborator}
            <FormField>
              <Checkbox
                checked={sharedWithIds.includes(collaborator._id.toString())}
                touch
                on:click={() => {
                  toggleSharedWith(collaborator._id);
                }}
              />
              <span slot="label">
                {collaborator.userName}
              </span>
            </FormField>
          {/each}
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
    display: flex;
    flex-direction: column;
  }
</style>
