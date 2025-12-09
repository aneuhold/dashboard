import {
  type DashboardTask,
  type DashboardTaskFilterAndSortResult,
  DashboardTaskListFilterSettingsSchema,
  DashboardTaskListSortSettingsSchema,
  type DashboardTaskMap,
  DashboardTaskService
} from '@aneuhold/core-ts-db-lib';
import type { UUID } from 'crypto';
import type { UserSettings } from '$stores/userSettings/userSettings';

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
      DashboardTaskListFilterSettingsSchema.parse(userSettings.config.userId);
    const taskSortSettings =
      userSettings.config.taskListSortSettings[category] ??
      DashboardTaskListSortSettingsSchema.parse(userSettings.config.userId);
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
    allChildrenIds: UUID[],
    task?: DashboardTask
  ): DashboardTaskFilterAndSortResult {
    if (!task) {
      return {
        filteredAndSortedIds: [],
        removedIds: []
      };
    }
    const userId = userSettings.config.userId;
    const taskFilterSettings =
      task.filterSettings[userId] ??
      userSettings.config.taskListFilterSettings[task.category] ??
      DashboardTaskListFilterSettingsSchema.parse(userId);
    const taskSortSettings =
      task.sortSettings[userId] ??
      userSettings.config.taskListSortSettings[task.category] ??
      DashboardTaskListSortSettingsSchema.parse(userId);
    return DashboardTaskService.getFilteredAndSortedTaskIds(
      taskMap,
      task.category,
      taskFilterSettings,
      taskSortSettings,
      userSettings.config.tagSettings,
      {
        taskId: task._id,
        allChildrenIds: allChildrenIds
      }
    );
  }
}
