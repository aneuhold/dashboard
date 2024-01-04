<!--
  @component
  
  A single task that can be displayed in a row format.
-->
<script lang="ts">
  import Card, { Content as CardContent } from '@smui/card';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import TaskService from 'util/TaskService';
  import type { MenuButtonItem } from './MenuButton.svelte';
  import MenuButton from './MenuButton.svelte';

  export let taskId: string;

  let task = TaskService.getTaskStore(taskId);

  let menuItems: MenuButtonItem[] = [
    {
      title: 'Edit',
      iconName: 'edit',
      clickAction: () => {
        console.log('edit');
      }
    },
    {
      title: 'Delete',
      iconName: 'delete',
      clickAction: () => {
        console.log('delete');
      }
    }
  ];
</script>

<div class="container">
  <Card>
    <CardContent>
      <div class="card-content">
        <div class="left-side">
          <FormField>
            <Checkbox bind:checked={$task.completed} touch />
          </FormField>
          <div>
            <h4 class="mdc-typography--body1 title">
              {$task.title}
            </h4>
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
            {#if $task.description}
              <div class="mdc-deprecated-list-item__secondary-text subtitle">
                {$task.description}
              </div>
            {/if}
          </div>
        </div>
        {#if menuItems.length > 0}
          <MenuButton {menuItems} />
        {/if}
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
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .left-side {
    display: flex;
    flex-direction: row;
    gap: 16px;
    align-items: center;
  }
</style>
