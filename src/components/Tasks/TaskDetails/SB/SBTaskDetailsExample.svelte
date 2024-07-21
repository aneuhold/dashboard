<script lang="ts">
  import SBMockData from '$storybook/globalMockData';
  import { DashboardTask } from '@aneuhold/core-ts-db-lib';
  import TaskDetails from '../TaskDetails.svelte';

  export let mainTaskExists = true;

  let mainTask: DashboardTask | undefined;
  $: taskId = mainTask ? mainTask._id.toString() : 'nonExistentTaskId';

  $: {
    SBMockData.taskMapServiceMock.reset();
    if (mainTaskExists) {
      mainTask = SBMockData.taskMapServiceMock.addTask({
        title: 'TestTask'
      });
    }
  }
</script>

<TaskDetails {taskId} />
