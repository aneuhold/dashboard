<script lang="ts">
  import TaskListService from '$services/Task/TaskListService';
  import taskMapService from '$services/Task/TaskMapService/TaskMapService';
  import {
    MockTaskAssignment,
    MockTaskDescription,
    MockTaskSharedWith,
    MockTaskSubTasks
  } from '$services/Task/TaskMapService/TaskMapService.mock';
  import { userConfig } from '$stores/local/userConfig/userConfig';
  import MockData from '$testUtils/MockData';
  import TaskList from '../TaskList.svelte';

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
  }: {
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
  } = $props();

  $effect(() => {
    MockData.taskMapServiceMock.reset();
    MockData.taskMapServiceMock.addTasks({
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

  let sortAndFilterResult = $derived(
    TaskListService.getTaskIds(taskMapService.mapState, $userConfig, 'default')
  );
</script>

<TaskList category="default" {sortAndFilterResult} />
