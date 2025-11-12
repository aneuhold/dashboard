<!--
  @component
  
  This component is a singleton, and should only ever be used once. Use the
  exported functions to show the dialog.
-->
<script lang="ts" module>
  import Button, { Label } from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import { Actions, Content, Title } from '@smui/dialog';
  import FormField from '@smui/form-field';
  import type { ObjectId } from 'bson';
  import { writable } from 'svelte/store';
  import { SmartDialog } from '$components/presentational';
  import { TaskMapService } from '$services/Task/TaskMapService/TaskMapService';
  import { currentUserId } from '$stores/derived/currentUserId';
  import { userSettings } from '$stores/userSettings/userSettings';

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
  const open = createOpenStore();

  function createOpenStore() {
    const { subscribe, set } = writable(false);

    return {
      subscribe,
      set: (value: boolean) => {
        if (value) {
          set(value);
        } else {
          // Reset the current task id when the dialog is closed. This helps
          // prevent errors if the task is deleted after the dialog is closed.
          currentTaskId.set(null);
          set(value);
        }
      }
    };
  }
</script>

<script lang="ts">
  let task = $derived($currentTaskId ? TaskMapService.getTaskStore($currentTaskId) : null);
  let sharedWithIds = $derived($task ? $task.sharedWith.map((id) => id.toString()) : []);
  let collaborators = $derived($userSettings.collaborators);
  let currentUserIsOwner = $derived($task ? $task.userId.toString() === $currentUserId : false);
  let title = $derived($task ? `Share "${$task.title}"` : 'There was an error, please tell Tony');

  function toggleSharedWith(id: ObjectId) {
    if (!$task) return;
    if (sharedWithIds.includes(id.toString())) {
      $task.sharedWith = $task.sharedWith.filter((sharedWithId) => {
        return sharedWithId.toString() !== id.toString();
      });
      if ($task.assignedTo?.toString() === id.toString() || $task.sharedWith.length === 0) {
        $task.assignedTo = undefined;
      }
    } else {
      $task.sharedWith.push(id);
      $task.sharedWith = $task.sharedWith;
    }
  }
</script>

<SmartDialog bind:open={$open}>
  {#if $task}
    <Title>{title}</Title>
    <Content>
      <div class="content">
        {#if Object.values(collaborators).length === 0}
          <i class="mdc-typography--body1 dimmed-color">No collaborators</i>
          <a href="/settings">Add one in settings here!</a>
        {:else if currentUserIsOwner}
          <span class="sectionTitle mdc-typography--body1">Share With</span>
          <span>Note that sharing automatically applies to all sub-tasks if enabled.</span>
          {#each Object.values(collaborators) as collaborator (collaborator._id.toString())}
            <FormField>
              <Checkbox
                checked={sharedWithIds.includes(collaborator._id.toString())}
                onclick={() => {
                  toggleSharedWith(collaborator._id);
                }}
              />
              {#snippet label()}
                <span>
                  {collaborator.userName}
                </span>
              {/snippet}
            </FormField>
          {/each}
        {/if}
      </div>
    </Content>
    <Actions>
      <Button
        onclick={() => {
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
  .sectionTitle {
    color: var(--mdc-theme-text-primary-on-background);
  }
</style>
