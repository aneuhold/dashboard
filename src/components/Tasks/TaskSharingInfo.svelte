<!--
  @component
  
  Sharing information for use in the Task Details component.
-->
<script lang="ts">
  import TaskService from 'util/TaskService';
  import { userSettings } from '../../stores/userSettings';

  export let taskId: string;

  $: task = TaskService.getTaskStore(taskId);
  /**
   * Only inlcudes the ids of the users that the current user is a collaborator
   * with.
   */
  $: sharedWithIds = $task.sharedWith
    .map((id) => id.toString())
    .filter((id) => $userSettings.collaborators[id]);
  $: collaborators = $userSettings.collaborators;
  $: userIsNotOwner = $task?.userId.toString() !== $userSettings.config.userId.toString();
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
        {#each sharedWithIds as sharedWithId}
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
  }
</style>
