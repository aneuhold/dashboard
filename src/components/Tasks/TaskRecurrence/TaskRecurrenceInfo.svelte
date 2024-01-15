<!--
  @component
  
  Reccurence information for use in the Task Details component.
-->
<script lang="ts">
  import {
    DashboardTaskService,
    RecurrenceBasis,
    RecurrenceEffect,
    RecurrenceFrequencyType,
    type RecurrenceInfo
  } from '@aneuhold/core-ts-db-lib';
  import { DateService } from '@aneuhold/core-ts-lib';
  import Accordion, { Content, Panel } from '@smui-extra/accordion';
  import Button, { Label } from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import Dialog, { Actions, Content as DialogContent, Title } from '@smui/dialog';
  import IconButton, { Icon } from '@smui/icon-button';
  import ClickableDiv from 'components/ClickableDiv.svelte';
  import TaskService from 'util/Task/TaskService';
  import TaskRecurrenceDetails from './TaskRecurrenceDetails.svelte';

  export let taskId: string;
  export let childTaskIds: string[];

  let recurringInfoOpen = false;
  let taskMap = TaskService.getStore();
  let previousTaskId = taskId;
  let errorInfoDialogOpen = false;
  let errorInfoDialogTitle = '';
  let errorInfoDialogContent = '';
  $: task = TaskService.getTaskStore(taskId);
  $: isRecurring = !!$task.recurrenceInfo;
  $: hasParentRecurringTask = !!$task.parentRecurringTaskInfo;
  $: hasChildRecurringTask = childTaskIds.some(
    (childTaskId) => !!$taskMap[childTaskId]?.recurrenceInfo
  );

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
      const defaultRecurrenceInfoClone = JSON.parse(JSON.stringify(defaultRecurrenceInfo));
      $task.recurrenceInfo = defaultRecurrenceInfoClone;
      recurringInfoOpen = true;
    }
  };

  const updateRecurrenceInfo = (event: CustomEvent<RecurrenceInfo>) => {
    $task.recurrenceInfo = event.detail;
  };

  const getNextRecurrenceDate = (recurrenceInfo: RecurrenceInfo) => {
    let date: Date | null = null;
    if (recurrenceInfo.recurrenceBasis === RecurrenceBasis.dueDate && $task.dueDate) {
      date = $task.dueDate;
    } else if (recurrenceInfo.recurrenceBasis === RecurrenceBasis.startDate && $task.startDate) {
      date = DashboardTaskService.getNextFrequencyDate($task.startDate, recurrenceInfo.frequency);
    }
    if (!date) {
      return 'Error: please tell Tony aboot this';
    }
    return DateService.getDateTimeString(date);
  };
</script>

<div class="container">
  <Accordion>
    <Panel variant="outlined" color="secondary" bind:open={recurringInfoOpen}>
      <div class={`headerContainer${!!$task.recurrenceInfo ? '' : ' dimmed-color'}`}>
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
                Recurs: {getNextRecurrenceDate($task.recurrenceInfo)}
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
        <TaskRecurrenceDetails
          disabled={!isRecurring || hasParentRecurringTask}
          recurrenceInfo={currentRecurrenceInfo}
          on:change={updateRecurrenceInfo}
          dueDate={$task.dueDate}
          startDate={$task.startDate}
          taskIsCompleted={$task.completed}
          parentRecurringTaskInfo={$task.parentRecurringTaskInfo}
        />
      </Content>
    </Panel>
  </Accordion>
</div>

<Dialog bind:open={errorInfoDialogOpen}>
  <Title>{errorInfoDialogTitle}</Title>
  <DialogContent>{errorInfoDialogContent}</DialogContent>
  <Actions>
    <Button
      on:click={() => {
        errorInfoDialogOpen = false;
      }}
    >
      <Label>Done</Label>
    </Button>
  </Actions>
</Dialog>

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
