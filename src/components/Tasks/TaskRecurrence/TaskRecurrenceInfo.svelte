<!--
  @component
  
  Reccurence information for use in the Task Details component.
-->
<script lang="ts">
  import {
    DashboardTask,
    RecurrenceBasis,
    RecurrenceEffect,
    RecurrenceFrequencyType,
    type RecurrenceInfo
  } from '@aneuhold/core-ts-db-lib';
  import { DateService } from '@aneuhold/core-ts-lib';
  import Button, { Label } from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import { Actions, Content as DialogContent, Title } from '@smui/dialog';
  import IconButton, { Icon } from '@smui/icon-button';
  import Accordion, { Content, Panel } from '@smui-extra/accordion';
  import { ClickableDiv, SmartDialog } from '$components/presentational';
  import { TaskMapService } from '../../../services/Task/TaskMapService/TaskMapService';
  import TaskRecurrenceService from '../../../services/Task/TaskRecurrenceService';
  import TaskService from '../../../services/Task/TaskService';
  import TaskRecurrenceDetails from './TaskRecurrenceDetails.svelte';

  let { taskId, childTaskIds }: { taskId: string; childTaskIds: string[] } = $props();

  let recurringInfoOpen = $state(false);
  const taskMap = TaskMapService.getStore();
  let previousTaskId = $state(taskId);
  let errorInfoDialogOpen = $state(false);
  let errorInfoDialogTitle = $state('');
  let errorInfoDialogContent = $state('');
  let task = $derived(TaskMapService.getTaskStore(taskId));
  let defaultRecurrenceInfo: RecurrenceInfo = $derived({
    frequency: {
      type: RecurrenceFrequencyType.everyXTimeUnit,
      everyXTimeUnit: {
        timeUnit: 'week',
        x: 1
      }
    },
    recurrenceBasis: $task.dueDate ? RecurrenceBasis.dueDate : RecurrenceBasis.startDate,
    recurrenceEffect: RecurrenceEffect.rollOnCompletion
  });
  let isRecurring = $derived(!!$task.recurrenceInfo);
  let hasParentRecurringTask = $derived(!!$task.parentRecurringTaskInfo);
  let hasChildRecurringTask = $derived(
    childTaskIds.some((childTaskId) => !!$taskMap[childTaskId]?.recurrenceInfo)
  );

  /**
   * This is purposefully not synced to the task store, so that updates
   * can happen separately.
   */
  let currentRecurrenceInfo = $derived($task.recurrenceInfo ?? defaultRecurrenceInfo);

  // Auto-close the accordion when switching tasks
  $effect(() => {
    if (previousTaskId !== taskId) {
      previousTaskId = taskId;
      recurringInfoOpen = false;
    }
  });

  function handleRecurringClick() {
    if (isRecurring) {
      $task.recurrenceInfo = undefined;
      recurringInfoOpen = false;
    } else if (!$task.startDate && !$task.dueDate) {
      errorInfoDialogTitle = 'Task is missing start date or due date';
      errorInfoDialogContent = 'Tasks must have a start date or due date to be set to recurring.';
      errorInfoDialogOpen = true;
    } else {
      // Create a clone. This is okay because none of the properties are
      // special objects, they are all simple JSON values.
      // The clone is helpful because it makes it so changes across tasks do
      // not reflect to each other.
      const defaultRecurrenceInfoClone = JSON.parse(
        JSON.stringify(defaultRecurrenceInfo)
      ) as RecurrenceInfo;
      $task.recurrenceInfo = defaultRecurrenceInfoClone;
      recurringInfoOpen = true;
    }
  }

  function getNextRecurrenceDate(task: DashboardTask): string {
    const date = TaskRecurrenceService.getNextRecurrenceDate(task);
    if (!date) {
      return 'Error: please tell Tony aboot this';
    }
    return DateService.getDateTimeString(date);
  }
</script>

<div class="container">
  <Accordion>
    <Panel variant="outlined" color="secondary" bind:open={recurringInfoOpen}>
      <div class={`headerContainer${$task.recurrenceInfo ? '' : ' dimmed-color'}`}>
        <div class="header">
          {#if !hasParentRecurringTask && (isRecurring || !hasChildRecurringTask)}
            <ClickableDiv clickAction={handleRecurringClick}>
              <Checkbox
                disabled={(!$task.startDate && !$task.dueDate) || hasParentRecurringTask}
                checked={!!$task.recurrenceInfo}
              />
            </ClickableDiv>
          {/if}
          <div class="headerText">
            <Icon class="material-icons">autorenew</Icon>
            {#if $task.parentRecurringTaskInfo && $taskMap[$task.parentRecurringTaskInfo.taskId.toString()]}
              <a
                href={TaskService.getTaskRoute(
                  $task.parentRecurringTaskInfo.taskId.toString(),
                  true
                )}
              >
                Parent
              </a>
            {/if}
            {#if hasChildRecurringTask && !$task.recurrenceInfo}
              <span>Recurring disabled (child task is recurring)</span>
            {:else if $task.recurrenceInfo && $task.recurrenceInfo.recurrenceEffect === RecurrenceEffect.rollOnCompletion}
              <span>Recurs: On Completion</span>
            {:else if $task.recurrenceInfo}
              <span>
                Recurs: {getNextRecurrenceDate($task)}
              </span>
            {:else}
              <span>Recurring</span>
            {/if}
          </div>
        </div>
        <IconButton toggle bind:pressed={recurringInfoOpen}>
          <Icon class="material-icons" on>expand_less</Icon>
          <Icon class="material-icons">expand_more</Icon>
        </IconButton>
      </div>
      <Content class="recurringPaperContent">
        <TaskRecurrenceDetails {taskId} recurrenceInfo={currentRecurrenceInfo} />
      </Content>
    </Panel>
  </Accordion>
</div>

<SmartDialog bind:open={errorInfoDialogOpen}>
  <Title>{errorInfoDialogTitle}</Title>
  <DialogContent>{errorInfoDialogContent}</DialogContent>
  <Actions>
    <Button
      onclick={() => {
        errorInfoDialogOpen = false;
      }}
    >
      <Label>Done</Label>
    </Button>
  </Actions>
</SmartDialog>

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
    text-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
    margin-bottom: 4px;
  }
</style>
