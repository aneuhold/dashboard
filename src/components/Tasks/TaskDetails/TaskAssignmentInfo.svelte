<!--
  @component
  
  Assignment information for use in the Task Details component.
-->
<script lang="ts">
  import { currentUserId } from '$stores/derived/currentUserId';
  import { userSettings } from '$stores/userSettings/userSettings';
  import LocalData from '$util/LocalData/LocalData';
  import { TaskMapService } from '../../../services/Task/TaskMapService/TaskMapService';

  export let taskId: string;

  $: task = TaskMapService.getTaskStore(taskId);
  $: collaborators = $userSettings.collaborators;
  // The below needs to be updated with a new store that has the user's info
  // in it.
  $: assignedUser = $task.assignedTo
    ? $currentUserId.toString() === $task.assignedTo.toString()
      ? { _id: $currentUserId, userName: LocalData.username }
      : collaborators[$task.assignedTo.toString()]
    : undefined;
  $: assignedUserIsCurrentuser =
    assignedUser && assignedUser._id.toString() === $currentUserId.toString();
</script>

{#if assignedUser}
  <div class="container">
    <span>Assigned To</span>
    <span class={assignedUserIsCurrentuser ? 'currentUserText' : 'dimmed-color'}>
      {assignedUserIsCurrentuser ? 'Me' : assignedUser.userName}
    </span>
  </div>
{/if}

<style>
  .currentUserText {
    color: var(--mdc-theme-primary);
  }
  .container {
    display: flex;
    flex-direction: column;
  }
</style>
