<script lang="ts">
  import { DashboardTask } from '@aneuhold/core-ts-db-lib';
  import type { UUID } from 'crypto';
  import {
    MockTaskAssignment,
    MockTaskSharedWith
  } from '$services/Task/TaskMapService/TaskMapService.mock';
  import MockData from '$testUtils/MockData';
  import TaskDetails from '../TaskDetails.svelte';

  let {
    mainTaskExists = true,
    sharedWith = MockTaskSharedWith.none,
    assignedTo = MockTaskAssignment.none
  }: {
    mainTaskExists?: boolean;
    sharedWith?: MockTaskSharedWith;
    assignedTo?: MockTaskAssignment;
  } = $props();

  let mainTask: DashboardTask | undefined = $state();
  let taskId = $derived(mainTask ? mainTask._id : ('non-existent-id' as UUID));

  $effect(() => {
    MockData.taskMapServiceMock.reset();
    if (mainTaskExists) {
      mainTask = MockData.taskMapServiceMock.addTask({
        title: 'TestTask',
        sharedWith: sharedWith,
        assignedTo: assignedTo
      });
    }
  });
</script>

<TaskDetails {taskId} />
