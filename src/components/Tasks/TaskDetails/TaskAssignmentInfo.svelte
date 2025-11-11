<!--
  @component
  
  Assignment information for use in the Task Details component.
-->
<script lang="ts">
  import { currentUserId } from '$stores/derived/currentUserId';
  import { userSettings } from '$stores/userSettings/userSettings';
  import LocalData from '$util/LocalData/LocalData';
  import { TaskMapService } from '../../../services/Task/TaskMapService/TaskMapService';

  interface Props {
    taskId: string;
  }

  let { taskId }: Props = $props();

  let task = $derived(TaskMapService.getTaskStore(taskId));
  let collaborators = $derived($userSettings.collaborators);
  // The below needs to be updated with a new store that has the user's info
  // in it.
  let assignedUser = $derived(
    $task.assignedTo
      ? $currentUserId === $task.assignedTo.toString()
        ? { _id: $currentUserId, userName: LocalData.username }
        : collaborators[$task.assignedTo.toString()]
      : undefined
  );
  let assignedUserIsCurrentuser = $derived(
    assignedUser && assignedUser._id.toString() === $currentUserId
  );
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
    align-items: flex-end;
  }
</style>
