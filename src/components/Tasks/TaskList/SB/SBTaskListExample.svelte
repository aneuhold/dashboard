<script lang="ts">
  import TaskListService from '$services/Task/TaskListService';
  import { TaskMapService } from '$services/Task/TaskMapService/TaskMapService';
  import { userSettings } from '$stores/userSettings/userSettings';
  import SBMockData from '$storybook/globalMockData';
  import TaskList from '../TaskList.svelte';

  export let numTasks = 20;
  export let includeStartDates = false;
  export let includeStartDatesInFuture = false;
  export let includeDueDates = false;
  export let includeOverDueDates = false;

  $: {
    SBMockData.taskMapServiceMock.reset();
    SBMockData.taskMapServiceMock.addTasks({
      numTasks,
      includeStartDates,
      includeStartDatesInFuture,
      includeDueDates,
      includeOverDueDates
    });
  }

  const taskMap = TaskMapService.getStore();

  $: sortAndFilterResult = TaskListService.getTaskIds($taskMap, $userSettings, 'default');
</script>

<TaskList category="default" {sortAndFilterResult} />
