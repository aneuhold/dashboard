<!--
  @component
  
  A single task that can be displayed in a row format.
-->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { DashboardTask, DashboardTaskService } from '@aneuhold/core-ts-db-lib';
  import Card, { Content as CardContent } from '@smui/card';
  import { Icon } from '@smui/icon-button';
  import ConfirmationDialog from 'components/ConfirmationDialog.svelte';
  import ClickableDiv from 'components/presentational/ClickableDiv.svelte';
  import type { MenuButtonItem } from 'components/presentational/MenuButton.svelte';
  import MenuButton from 'components/presentational/MenuButton.svelte';
  import { onMount } from 'svelte';
  import { TaskMapService } from '../../services/Task/TaskMapService';
  import TaskService from '../../services/Task/TaskService';
  import { currentUserId } from '../../stores/derived/currentUserId';
  import { userSettings } from '../../stores/userSettings';
  import TaskCompletedCheckbox from './TaskCompletedCheckbox.svelte';
  import TaskRowDateInfo from './TaskDate/TaskRowDateInfo.svelte';
  import TaskSharingDialog from './TaskSharingDialog.svelte';

  export let taskId: string;

  let deleteDialogOpen = false;
  let shareDialogOpen = false;
  /**
   * Used so that the animation doesn't play every time the task shows up,
   * only when completed is clicked.
   */
  let completeAnimationShouldShow = false;
  let previousTaskCompletedState: boolean;
  let hasMounted = false;
  let taskMap = TaskMapService.getStore();

  $: task = TaskMapService.getTaskStore(taskId);
  $: allChildrenIds = $task
    ? DashboardTaskService.getChildrenIds(Object.values($taskMap), [$task._id])
    : [];
  $: hasExtraTaskInfo = allChildrenIds.length > 0;
  $: finalSharedParentId = $task ? TaskService.findParentIdWithSameSharedWith($task) : '';
  $: menuItems = getMenuItems($task);
  $: currentStrikeClass =
    completeAnimationShouldShow && $task.completed
      ? ' strikeAnimate'
      : $task.completed
        ? ' strike'
        : '';
  $: currentDimClass =
    completeAnimationShouldShow && $task.completed ? ' dimAnimate' : $task.completed ? ' dim' : '';

  $: if ($task.completed !== previousTaskCompletedState && hasMounted) {
    completeAnimationShouldShow = true;
  }

  function goToTask() {
    goto(TaskService.getTaskRoute(taskId));
  }

  function deleteTask() {
    taskMap.deleteDoc(taskId);
  }

  function handleDeleteClick() {
    if (allChildrenIds.length > 0) {
      deleteDialogOpen = true;
      return;
    }
    deleteTask();
  }

  function handleDuplicateClick() {
    taskMap.upsertMany(
      TaskMapService.getDuplicateTaskUpdateInfo(taskId, (task) => {
        // Conditional to find the original task that is being duplicated
        if (
          !task.parentTaskId ||
          ($task.parentTaskId && task.parentTaskId.toString() === $task.parentTaskId.toString())
        ) {
          task.title = `${task.title} (Copy)`;
        }
        return task;
      })
    );
  }

  function getMenuItems(task: DashboardTask) {
    let menuItems: MenuButtonItem[] = [
      {
        title: 'Edit',
        iconName: 'edit',
        clickAction: goToTask
      }
    ];
    if (
      task.userId.toString() === $userSettings.config.userId.toString() &&
      finalSharedParentId === taskId
    ) {
      menuItems.push({
        title: 'Share',
        iconName: 'share',
        clickAction: () => {
          shareDialogOpen = true;
        }
      });
    }
    menuItems.push({
      title: 'Duplicate',
      iconName: 'content_copy',
      clickAction: handleDuplicateClick
    });
    menuItems.push({
      title: 'Delete',
      iconName: 'delete',
      clickAction: handleDeleteClick
    });
    return menuItems;
  }

  onMount(() => {
    previousTaskCompletedState = $task.completed;
    hasMounted = true;
  });
</script>

<div class="container">
  <Card>
    <CardContent class="taskRowCard">
      <div class="card-content">
        <TaskCompletedCheckbox {taskId} />
        <ClickableDiv clickAction={goToTask}>
          <div class={currentDimClass}>
            <h4 class={`mdc-typography--body1 title${currentStrikeClass}`}>
              {#if $task.title !== ''}
                <span>{$task.title}</span>
              {:else}
                <i class="dimmed-color">Untitled</i>
              {/if}
              {#if $task.sharedWith.length > 0}
                <Icon class="material-icons dimmed-color small-icon">group</Icon>
              {/if}
              {#if $task.recurrenceInfo}
                <Icon class="material-icons dimmed-color small-icon">autorenew</Icon>
              {/if}
              {#if $task.tags[$currentUserId]?.length > 0}
                <div class="tagsContainer">
                  <Icon class="material-icons dimmed-color small-icon">sell</Icon>
                  {#each $task.tags[$currentUserId] as tag, index}
                    <i class="mdc-typography--caption mdc-theme--text-hint-on-background">
                      {`${tag}${index === $task.tags[$currentUserId].length - 1 ? '' : ', '}`}
                    </i>
                  {/each}
                </div>
              {/if}
            </h4>
            <TaskRowDateInfo {taskId} />
            {#if $task.description && $task.description !== ''}
              <div class="mdc-deprecated-list-item__secondary-text subtitle">
                {$task.description}
              </div>
            {/if}
            {#if hasExtraTaskInfo}
              <div class="mdc-typography--caption mdc-theme--text-hint-on-background extraTaskInfo">
                {#if allChildrenIds.length > 0}
                  {allChildrenIds.length} child task{allChildrenIds.length > 1 ? 's' : ''}
                {/if}
              </div>
            {/if}
          </div>
        </ClickableDiv>
        <MenuButton {menuItems} alignCenterVertically />
      </div>
    </CardContent>
  </Card>
</div>

<ConfirmationDialog
  title="Delete Task"
  message={`Are you sure you want to delete ${
    $task.title === '' ? 'this task' : `"${$task.title}"`
  }? It has ${allChildrenIds.length} sub task${allChildrenIds.length > 1 ? 's' : ''}.`}
  bind:open={deleteDialogOpen}
  on:confirm={deleteTask}
/>

<TaskSharingDialog {taskId} bind:open={shareDialogOpen} />

<style>
  * :global(.taskRowCard) {
    padding-left: 0px;
    padding-right: 0px;
  }
  .container {
    padding: 2px;
  }
  .subtitle {
    margin-top: 4px;
    margin-bottom: 0px;
    text-wrap: wrap;
    max-height: 1lh;
  }
  .subtitle::before {
    display: none;
  }
  .extraTaskInfo {
    margin-top: 2px;
    margin-bottom: 0px;
  }
  .title {
    margin-top: 0px;
    margin-bottom: 0px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }
  .tagsContainer {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }
  .card-content {
    display: grid;
    grid-template-columns: min-content 1fr min-content;
  }
  .dim {
    opacity: 0.3;
  }
  .dimAnimate {
    animation-name: dim;
    animation-duration: 1s;
    animation-timing-function: cubic-bezier(0.5, 1, 0.5, 1);
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
  }
  .strike {
    position: relative;
    &::after {
      content: ' ';
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 1px;
      opacity: 0.3;
      background: var(--mdc-theme-text-primary-on-background);
    }
  }
  .strikeAnimate {
    position: relative;
  }
  .strikeAnimate::after {
    content: ' ';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    background: var(--mdc-theme-text-primary-on-background);
    animation-name: strike;
    animation-duration: 1s;
    animation-timing-function: cubic-bezier(0.5, 1, 0.5, 1);
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
  }
  @keyframes dim {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0.3;
    }
  }
  @keyframes strike {
    0% {
      width: 0;
    }
    100% {
      width: 100%;
    }
  }
</style>
