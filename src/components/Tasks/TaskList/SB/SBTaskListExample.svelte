<script lang="ts">
  import { run } from 'svelte/legacy';

  import TaskListService from '$services/Task/TaskListService';
  import { TaskMapService } from '$services/Task/TaskMapService/TaskMapService';
  import {
    MockTaskAssignment,
    MockTaskDescription,
    MockTaskSharedWith,
    MockTaskSubTasks
  } from '$services/Task/TaskMapService/TaskMapService.mock';
  import { userSettings } from '$stores/userSettings/userSettings';
  import SBMockData from '$storybook/globalMockData';
  import TaskList from '../TaskList.svelte';

  interface Props {
    numTasks?: number;
    includeStartDates?: boolean;
    includeStartDatesInFuture?: boolean;
    includeDueDates?: boolean;
    includeOverDueDates?: boolean;
    sharedWith?: MockTaskSharedWith;
    assignedTo?: MockTaskAssignment;
    tags?: string[];
    descriptions?: MockTaskDescription;
    subtasks?: MockTaskSubTasks;
  }

  let {
    numTasks = 20,
    includeStartDates = false,
    includeStartDatesInFuture = false,
    includeDueDates = false,
    includeOverDueDates = false,
    sharedWith = MockTaskSharedWith.none,
    assignedTo = MockTaskAssignment.none,
    tags = [],
    descriptions = MockTaskDescription.none,
    subtasks = MockTaskSubTasks.none
  }: Props = $props();

  run(() => {
    SBMockData.taskMapServiceMock.reset();
    SBMockData.taskMapServiceMock.addTasks({
      numTasks,
      includeStartDates,
      includeStartDatesInFuture,
      includeDueDates,
      includeOverDueDates,
      sharedWith,
      assignedTo,
      tags,
      descriptions,
      subtasks
    });
  });

  const taskMap = TaskMapService.getStore();

  let sortAndFilterResult = $derived(
    TaskListService.getTaskIds($taskMap, $userSettings, 'default')
  );
</script>

<TaskList category="default" {sortAndFilterResult} />
