<!--
  @component
  
  A dialog for sharing a task with collaborators.
-->
<script lang="ts">
  import Button, { Label } from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import Dialog, { Actions, Content, Title } from '@smui/dialog';
  import FormField from '@smui/form-field';
  import type { ObjectId } from 'bson';
  import { TaskMapService } from '../../services/Task/TaskMapService';
  import { userSettings } from '../../stores/userSettings';

  export let open = false;
  export let taskId: string;

  $: task = TaskMapService.getTaskStore(taskId);
  $: sharedWithIds = $task.sharedWith.map((id) => id.toString());
  $: collaborators = $userSettings.collaborators;

  function toggleSharedWith(id: ObjectId) {
    if (sharedWithIds.includes(id.toString())) {
      $task.sharedWith = $task.sharedWith.filter((sharedWithId) => {
        return sharedWithId.toString() !== id.toString();
      });
    } else {
      $task.sharedWith.push(id);
      $task.sharedWith = $task.sharedWith;
    }
  }

  const handleDone = () => {
    open = false;
  };
</script>

<Dialog bind:open>
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
    <Button on:click={handleDone}>
      <Label>Done</Label>
    </Button>
  </Actions>
</Dialog>

<style>
  .content {
    display: flex;
    flex-direction: column;
  }
</style>
