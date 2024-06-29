<script lang="ts">
  import TaskListService from '$services/Task/TaskListService';
  import { TaskMapService } from '$services/Task/TaskMapService/TaskMapService';
  import { userSettings } from '$stores/userSettings/userSettings';
  import TaskList from './TaskList.svelte';

  const taskMap = TaskMapService.getStore();

  $: sortAndFilterResult = TaskListService.getTaskIds($taskMap, $userSettings, 'default');
</script>

<TaskList category="default" {sortAndFilterResult} />
