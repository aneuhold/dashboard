<!--
  @component
  
  A single task that can be displayed in a row format.
-->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { DashboardTask, DashboardTaskService } from '@aneuhold/core-ts-db-lib';
  import Card, { Content as CardContent } from '@smui/card';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import { Icon } from '@smui/icon-button';
  import ClickableDiv from 'components/ClickableDiv.svelte';
  import ConfirmationDialog from 'components/ConfirmationDialog.svelte';
  import type { MenuButtonItem } from 'components/MenuButton.svelte';
  import MenuButton from 'components/MenuButton.svelte';
  import TaskService from 'util/Task/TaskService';
  import { userSettings } from '../../stores/userSettings';
  import TaskSharingDialog from './TaskSharingDialog.svelte';

  export let taskId: string;

  let deleteDialogOpen = false;
  let shareDialogOpen = false;
  $: task = TaskService.getTaskStore(taskId);
  let taskMap = TaskService.getStore();
  $: allChildrenIds = $task
    ? DashboardTaskService.getChildrenIds(Object.values($taskMap), [$task._id])
    : [];
  $: hasExtraTaskInfo = allChildrenIds.length > 0;
  $: finalParentId = TaskService.findParentIdWithSameSharedWith($task);
  $: menuItems = getMenuItems($task);

  function goToTask() {
    goto(TaskService.getTaskRoute(taskId));
  }

  function deleteTask() {
    taskMap.deleteTask(taskId);
  }

  function handleDeleteClick() {
    if (allChildrenIds.length > 0) {
      deleteDialogOpen = true;
      return;
    }
    deleteTask();
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
      finalParentId === taskId
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
      title: 'Delete',
      iconName: 'delete',
      clickAction: handleDeleteClick
    });
    return menuItems;
  }
</script>

<div class="container">
  <Card>
    <CardContent>
      <div class="card-content">
        <FormField>
          <Checkbox bind:checked={$task.completed} touch />
        </FormField>
        <ClickableDiv clickAction={goToTask}>
          <h4 class="mdc-typography--body1 title">
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
            {#if $task.tags.length > 0}
              <div class="tagsContainer">
                <Icon class="material-icons dimmed-color small-icon">sell</Icon>
                {#each $task.tags as tag, index}
                  <i class="mdc-typography--caption mdc-theme--text-hint-on-background">
                    {`${tag}${index === $task.tags.length - 1 ? '' : ', '}`}
                  </i>
                {/each}
              </div>
            {/if}
          </h4>

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
  .container {
    padding: 2px;
  }
  .subtitle {
    margin-top: 4px;
    margin-bottom: 0px;
    text-wrap: wrap;
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
</style>
