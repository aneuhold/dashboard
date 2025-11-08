<script lang="ts">
  import { run } from 'svelte/legacy';

  import {
    MockTaskAssignment,
    MockTaskSharedWith
  } from '$services/Task/TaskMapService/TaskMapService.mock';
  import SBMockData from '$storybook/globalMockData';
  import { DashboardTask } from '@aneuhold/core-ts-db-lib';
  import TaskDetails from '../TaskDetails.svelte';

  interface Props {
    mainTaskExists?: boolean;
    sharedWith?: MockTaskSharedWith;
    assignedTo?: MockTaskAssignment;
  }

  let {
    mainTaskExists = true,
    sharedWith = MockTaskSharedWith.none,
    assignedTo = MockTaskAssignment.none
  }: Props = $props();

  let mainTask: DashboardTask | undefined = $state();
  let taskId = $derived(mainTask ? mainTask._id.toString() : 'nonExistentTaskId');

  run(() => {
    SBMockData.taskMapServiceMock.reset();
    if (mainTaskExists) {
      mainTask = SBMockData.taskMapServiceMock.addTask({
        title: 'TestTask',
        sharedWith: sharedWith,
        assignedTo: assignedTo
      });
    }
  });
</script>

<TaskDetails {taskId} />
