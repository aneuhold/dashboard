<!--
  @component
  
  Assignment information for use in the Task Details component.
-->
<script lang="ts">
  import type { UUID } from 'crypto';
  import taskMapService from '$services/Task/TaskMapService/TaskMapService';
  import { currentUserId } from '$stores/derived/currentUserId';
  import { userConfig } from '$stores/local/userConfig/userConfig';
  import LocalData from '$util/LocalData/LocalData';

  let { taskId }: { taskId: UUID } = $props();

  let task = $derived(taskMapService.mapState[taskId]);
  let collaborators = $derived($userConfig.collaborators);
  // The below needs to be updated with a new store that has the user's info
  // in it.
  let assignedUser = $derived(
    task?.assignedTo
      ? $currentUserId === task.assignedTo
        ? { _id: $currentUserId, userName: LocalData.username }
        : collaborators[task.assignedTo]
      : undefined
  );
  let assignedUserIsCurrentUser = $derived(assignedUser && assignedUser._id === $currentUserId);
</script>

{#if assignedUser}
  <div class="container">
    <span>Assigned To</span>
    <span class={assignedUserIsCurrentUser ? 'currentUserText' : 'dimmed-color'}>
      {assignedUserIsCurrentUser ? 'Me' : assignedUser.userName}
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
