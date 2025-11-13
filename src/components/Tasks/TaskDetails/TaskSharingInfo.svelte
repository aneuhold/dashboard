<!--
  @component
  
  Sharing information for use in the Task Details component.
-->
<script lang="ts">
  import { TaskMapService } from '$services/Task/TaskMapService/TaskMapService';
  import { userSettings } from '$stores/userSettings/userSettings';

  let { taskId }: { taskId: string } = $props();

  let task = $derived(TaskMapService.getTaskStore(taskId));
  /**
   * Only inlcudes the ids of the users that the current user is a collaborator
   * with.
   */
  let sharedWithIds = $derived(
    $task.sharedWith.map((id) => id.toString()).filter((id) => $userSettings.collaborators[id])
  );
  let collaborators = $derived($userSettings.collaborators);
  let userIsNotOwner = $derived($task.userId.toString() !== $userSettings.config.userId.toString());
</script>

<div class="container">
  {#if userIsNotOwner}
    <div class="taskOwnerTitle">
      <span>Task Owner</span>
      <span class="dimmed-color">
        {collaborators[$task.userId.toString()].userName}
      </span>
    </div>
  {:else if Object.values(collaborators).length > 0}
    {#if sharedWithIds.length > 0}
      <span class="sharedWithTitle">Shared With</span>
      <ul class="sharedWithList">
        {#each sharedWithIds as sharedWithId (sharedWithId)}
          <li class="dimmed-color">{collaborators[sharedWithId].userName}</li>
        {/each}
      </ul>
    {/if}
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  .taskOwnerTitle {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
  }
  .sharedWithList {
    margin-top: 0px;
    margin-left: 0px;
    padding-inline-start: 24px;
    margin-block-end: 0px;
  }
</style>
