<script lang="ts">
  import SmartDialog from '$components/presentational/SmartDialog.svelte';
  import type { DashboardTaskListFilterSettings } from '@aneuhold/core-ts-db-lib';
  import Button, { Label } from '@smui/button';
  import { Actions, Content, Title } from '@smui/dialog';
  import { createEventDispatcher } from 'svelte';
  import TaskTagsService from '../../../services/Task/TaskTagsService';
  import TaskFilterSetting from './TaskFilterSetting.svelte';

  interface Props {
    open: boolean;
    initialSettings: DashboardTaskListFilterSettings;
  }

  let { open = $bindable(), initialSettings }: Props = $props();

  const userTags = TaskTagsService.getStore();

  let currentSettings: DashboardTaskListFilterSettings = $state();
  let previousOpen = $state(false);
  $effect(() => {
    currentSettings = JSON.parse(
      JSON.stringify(initialSettings)
    ) as DashboardTaskListFilterSettings;
  });

  $effect(() => {
    if (open !== previousOpen) {
      currentSettings = JSON.parse(
        JSON.stringify(initialSettings)
      ) as DashboardTaskListFilterSettings;
    }
    previousOpen = open;
  });

  const dispatch = createEventDispatcher<{
    updateSettings: DashboardTaskListFilterSettings;
    reset: unknown;
  }>();

  const handleDone = () => {
    dispatch('updateSettings', currentSettings);
    open = false;
  };
  const handleCancel = () => {
    open = false;
  };
  const handleReset = () => {
    dispatch('reset');
    open = false;
  };
</script>

<SmartDialog bind:open>
  <Title>Task Filtering Options</Title>
  <Content>
    <TaskFilterSetting
      settingName="Show Completed"
      enabled={currentSettings.completed.show}
      onclick={() => {
        currentSettings.completed.show = !currentSettings.completed.show;
      }}
    />
    <TaskFilterSetting
      settingName="Show Future Tasks"
      enabled={currentSettings.startDate.showFutureTasks}
      onclick={() => {
        currentSettings.startDate.showFutureTasks = !currentSettings.startDate.showFutureTasks;
      }}
    />
    <TaskFilterSetting
      settingName="Show All Children Tasks"
      enabled={currentSettings.grandChildrenTasks.show}
      onclick={() => {
        currentSettings.grandChildrenTasks.show = !currentSettings.grandChildrenTasks.show;
      }}
    />
    <span class="tagsSeparator">Show Tags</span>
    {#each $userTags as tag}
      <TaskFilterSetting
        settingName={tag}
        enabled={currentSettings.tags[tag] ? currentSettings.tags[tag].show : true}
        onclick={() => {
          if (currentSettings.tags[tag]) {
            currentSettings.tags[tag].show = !currentSettings.tags[tag].show;
          } else {
            currentSettings.tags[tag] = {
              show: false
            };
          }
        }}
      />
    {/each}
  </Content>
  <Actions>
    <Button color="secondary" on:click={handleReset}>
      <Label>Reset</Label>
    </Button>
    <Button on:click={handleCancel}>
      <Label>Cancel</Label>
    </Button>
    <Button on:click={handleDone}>
      <Label>Done</Label>
    </Button>
  </Actions>
</SmartDialog>

<style>
  .tagsSeparator {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 8px;
  }
</style>
