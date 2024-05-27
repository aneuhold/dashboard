import type { UserSettings } from '$stores/userSettings';
import {
    DashboardTask,
    DashboardTaskService,
    getDefaultTaskListFilterSettings,
    getDefaultTaskListSortSettings,
    type DashboardTaskFilterAndSortResult,
    type DashboardTaskMap
} from '@aneuhold/core-ts-db-lib';

/**
 * A service responsible for getting filtered and sorted lists of task IDs.
 */
export default class TaskListService {
  static getTaskIds(
    taskMap: DashboardTaskMap,
    userSettings: UserSettings,
    category: string
  ): DashboardTaskFilterAndSortResult {
    const taskFilterSettings =
      userSettings.config.taskListFilterSettings[category] ??
      getDefaultTaskListFilterSettings(userSettings.config.userId.toString());
    const taskSortSettings =
      userSettings.config.taskListSortSettings[category] ??
      getDefaultTaskListSortSettings(userSettings.config.userId.toString());
    return DashboardTaskService.getFilteredAndSortedTaskIds(
      taskMap,
      category,
      taskFilterSettings,
      taskSortSettings,
      userSettings.config.tagSettings
    );
  }

  static getTaskIdsForTask(
    taskMap: DashboardTaskMap,
    userSettings: UserSettings,
    allChildrenIds: string[],
    task?: DashboardTask
  ): DashboardTaskFilterAndSortResult {
    if (!task) {
      return {
        filteredAndSortedIds: [],
        removedIds: []
      };
    }
    const userId = userSettings.config.userId.toString();
    const taskFilterSettings =
      task.filterSettings[userId] ??
      userSettings.config.taskListFilterSettings[task.category] ??
      getDefaultTaskListFilterSettings(userId);
    const taskSortSettings =
      task.sortSettings[userId] ??
      userSettings.config.taskListSortSettings[task.category] ??
      getDefaultTaskListSortSettings(userId);
    return DashboardTaskService.getFilteredAndSortedTaskIds(
      taskMap,
      task.category,
      taskFilterSettings,
      taskSortSettings,
      userSettings.config.tagSettings,
      {
        taskId: task._id.toString(),
        allChildrenIds: allChildrenIds
      }
    );
  }
}
