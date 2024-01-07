<!--
  @component
  
  A single task that can be displayed in a row format.
-->
<script lang="ts">
  import { goto } from '$app/navigation';
  import Card, { Content as CardContent } from '@smui/card';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import ClickableDiv from 'components/ClickableDiv.svelte';
  import type { MenuButtonItem } from 'components/MenuButton.svelte';
  import MenuButton from 'components/MenuButton.svelte';
  import TaskService from 'util/TaskService';

  export let taskId: string;

  function goToTask() {
    goto(TaskService.getTaskRoute(taskId));
  }

  let task = TaskService.getTaskStore(taskId);

  let menuItems: MenuButtonItem[] = [
    {
      title: 'Edit',
      iconName: 'edit',
      clickAction: goToTask
    },
    {
      title: 'Delete',
      iconName: 'delete',
      clickAction: () => {
        TaskService.getStore().deleteTask(taskId);
      }
    }
  ];
</script>

<div class="container">
  <Card>
    <CardContent>
      <div class="card-content">
        <FormField>
          <Checkbox bind:checked={$task.completed} touch />
        </FormField>
        <ClickableDiv clickAction={goToTask}>
          {#if $task.title !== ''}
            <h4 class="mdc-typography--body1 title">
              {$task.title}
            </h4>
          {:else}
            <h4 class="mdc-typography--body1 title dimmed-color">
              <i>Untitled</i>
            </h4>
          {/if}
          {#if $task.tags.length > 0}
            <div class="mdc-typography--caption mdc-theme--text-hint-on-background">
              {#each $task.tags as tag, index}
                <span><i>{tag}</i></span>
                {#if index !== tag.length - 1}
                  <span>, </span>
                {/if}
              {/each}
            </div>
          {/if}
          {#if $task.description && $task.description !== ''}
            <div class="mdc-deprecated-list-item__secondary-text subtitle">
              {$task.description}
            </div>
          {/if}
        </ClickableDiv>
        <MenuButton {menuItems} />
      </div>
    </CardContent>
  </Card>
</div>

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
  .title {
    margin-top: 0px;
    margin-bottom: 0px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
  }
  .card-content {
    display: grid;
    grid-template-columns: min-content 1fr min-content;
  }
</style>
