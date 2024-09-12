<script lang="ts">
  import {
    MockTaskAssignment,
    MockTaskSharedWith
  } from '$services/Task/TaskMapService/TaskMapService.mock';
  import SBMockData from '$storybook/globalMockData';
  import { DashboardTask } from '@aneuhold/core-ts-db-lib';
  import TaskDetails from '../TaskDetails.svelte';

  export let mainTaskExists = true;
  export let sharedWith: MockTaskSharedWith = MockTaskSharedWith.none;
  export let assignedTo: MockTaskAssignment = MockTaskAssignment.none;

  let mainTask: DashboardTask | undefined;
  $: taskId = mainTask ? mainTask._id.toString() : 'nonExistentTaskId';

  $: {
    SBMockData.taskMapServiceMock.reset();
    if (mainTaskExists) {
      mainTask = SBMockData.taskMapServiceMock.addTask({
        title: 'TestTask',
        sharedWith: sharedWith,
        assignedTo: assignedTo
      });
    }
  }
</script>

<TaskDetails {taskId} />
