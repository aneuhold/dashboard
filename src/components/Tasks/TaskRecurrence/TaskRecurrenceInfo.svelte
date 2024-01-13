<!--
  @component
  
  Reccurence information for use in the Task Details component.
-->
<script lang="ts">
  import {
    RecurrenceBasis,
    RecurrenceEffect,
    RecurrenceFrequencyType,
    type RecurrenceInfo
  } from '@aneuhold/core-ts-db-lib';
  import Accordion, { Content, Panel } from '@smui-extra/accordion';
  import Checkbox from '@smui/checkbox';
  import IconButton, { Icon } from '@smui/icon-button';
  import TaskService from 'util/TaskService';
  import TaskRecurrenceDetails from './TaskRecurrenceDetails.svelte';

  export let taskId: string;

  let recurringInfoOpen = false;
  let taskMap = TaskService.getStore();
  let previousTaskId = taskId;
  $: task = TaskService.getTaskStore(taskId);
  $: isRecurring = !!$task.recurrenceInfo;
  $: hasParentRecurringTask = !!$task.parentRecurringTaskId;
  /**
   * This is purposefully not synced to the task store, so that updates
   * can happen separately.
   */
  $: currentRecurrenceInfo = $task.recurrenceInfo ?? defaultRecurrenceInfo;

  // Auto-close the accordion when switching tasks
  $: if (previousTaskId !== taskId) {
    previousTaskId = taskId;
    recurringInfoOpen = false;
  }

  let defaultRecurrenceInfo: RecurrenceInfo = {
    frequency: {
      type: RecurrenceFrequencyType.everyXTimeUnit,
      everyXTimeUnit: {
        timeUnit: 'week',
        x: 1
      }
    },
    recurrenceBasis: RecurrenceBasis.dueDate,
    recurrenceEffect: RecurrenceEffect.rollOnCompletion
  };

  const handleRecurringClick = () => {
    if (isRecurring) {
      taskMap.updateTaskAndAllChildren(taskId, (task) => {
        task.recurrenceInfo = undefined;
        task.parentRecurringTaskId = undefined;
        return task;
      });
      recurringInfoOpen = false;
    } else {
      taskMap.updateTaskAndAllChildren(taskId, (task) => {
        if (task._id.toString() === taskId) {
          task.recurrenceInfo = defaultRecurrenceInfo;
        } else {
          task.parentRecurringTaskId = $task._id;
        }
        return task;
      });
      recurringInfoOpen = true;
    }
  };

  const updateRecurrenceInfo = (event: CustomEvent<RecurrenceInfo>) => {
    taskMap.updateTaskAndAllChildren(taskId, (task) => {
      task.recurrenceInfo = event.detail;
      return task;
    });
  };
</script>

<!-- Only use the accordion when there is an option to set recurrence, other
wise set this up to just show a link to the parent and when the parent will recur next.
-->
<div class="container">
  {#if !hasParentRecurringTask}
    <Accordion>
      <Panel variant="outlined" color="secondary" bind:open={recurringInfoOpen}>
        <div class={`headerContainer${isRecurring ? '' : ' dimmed-color'}`}>
          <div class="header">
            <Checkbox checked={isRecurring} on:click={handleRecurringClick} />
            <div class="headerText">
              <Icon class="material-icons">autorenew</Icon>
              <span>Recurring</span>
            </div>
          </div>
          <IconButton toggle bind:pressed={recurringInfoOpen}>
            <Icon class="material-icons" on>expand_less</Icon>
            <Icon class="material-icons">expand_more</Icon>
          </IconButton>
        </div>
        <Content class="recurringPaperContent">
          <TaskRecurrenceDetails
            disabled={!isRecurring}
            recurrenceInfo={currentRecurrenceInfo}
            on:change={updateRecurrenceInfo}
            hasDueDate={!!$task.dueDate}
            hasStartDate={!!$task.startDate}
          />
        </Content>
      </Panel>
    </Accordion>
  {/if}
</div>

<style>
  /* To make it so that the separator lines go all the way across */
  * :global(.smui-accordion .smui-paper__content.recurringPaperContent) {
    padding: 0;
    padding-right: 1px;
  }
  .container {
    display: flex;
    flex-direction: column;
  }
  .headerContainer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px;
  }
  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .headerText {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
  }
</style>
