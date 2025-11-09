<!--
  @component
  
  This component is a singleton, and should only ever be used once. Use the
  exported functions to show the dialog.
-->
<script lang="ts" module>
  import SmartDialog from '$components/presentational/SmartDialog.svelte';
  import { TaskMapService } from '$services/Task/TaskMapService/TaskMapService';
  import { userSettings } from '$stores/userSettings/userSettings';
  import Button, { Label } from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import { Actions, Content, Title } from '@smui/dialog';
  import FormField from '@smui/form-field';
  import type { ObjectId } from 'bson';
  import { writable } from 'svelte/store';

  /**
   * A task assignment dialog which can be used anywhere in the app.
   */
  export const taskAssignmentDialog = {
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
  let sharedWithUsers = $derived([
    { _id: $userSettings.config.userId, userName: 'Me' },
    ...Object.values(collaborators).filter((collaborator) => {
      return (
        sharedWithIds.includes(collaborator._id.toString()) ||
        collaborator._id.toString() === $task?.userId.toString()
      );
    })
  ]);

  function toggleAssignment(id: ObjectId) {
    if (!$task) return;
    if (id.toString() === $task.assignedTo?.toString()) {
      $task.assignedTo = undefined;
    } else {
      $task.assignedTo = id;
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
        {:else if sharedWithIds.length > 0}
          <span class="sectionTitle mdc-typography--body1">Assign To</span>
          {#each Object.values(sharedWithUsers) as sharedWithUser (sharedWithUser._id.toString())}
            <FormField>
              <Checkbox
                checked={$task.assignedTo?.toString() === sharedWithUser._id.toString()}
                onclick={() => {
                  toggleAssignment(sharedWithUser._id);
                }}
              />
              {#snippet label()}
                <span>
                  {sharedWithUser.userName}
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
