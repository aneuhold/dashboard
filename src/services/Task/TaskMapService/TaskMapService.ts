import {
  type DashboardTask,
  DashboardTaskService,
  type DocumentMap
} from '@aneuhold/core-ts-db-lib';
import { DateService } from '@aneuhold/core-ts-lib';
import type { Updater } from 'svelte/store';
import { userSettings } from '$stores/userSettings/userSettings';
import DashboardTaskAPIService from '$util/api/DashboardTaskAPIService';
import LocalData from '$util/LocalData/LocalData';
import type {
  DocumentInsertOrUpdateInfo,
  DocumentMapStore,
  DocumentStore,
  UpsertManyInfo
} from '../../DocumentMapStoreService';
import DocumentMapStoreService from '../../DocumentMapStoreService';
import TaskOperationsService from '../TaskOperationsService';
import TaskRecurrenceService from '../TaskRecurrenceService';
import TaskSharingService from '../TaskSharingService';
import TaskTagsService from '../TaskTagsService';

/**
 * The main task map service.
 */
export class TaskMapService extends DocumentMapStoreService<DashboardTask> {
  private static instance = new TaskMapService();

  private constructor() {
    super();
  }

  static getStore(): DocumentMapStore<DashboardTask> {
    return this.instance.store;
  }

  static getTaskStore(taskId: string): DocumentStore<DashboardTask> {
    return this.instance.getDocStore(taskId);
  }

  static getMap(): DocumentMap<DashboardTask> {
    return this.instance.documentMap;
  }

  /**
   * Executes recurrence for the provided task if needed. This is a facade
   * method that delegates to TaskRecurrenceService.
   *
   * @param task The task to check and execute recurrence for
   */
  static executeRecurrenceIfNeeded(task: DashboardTask): void {
    TaskRecurrenceService.executeRecurrenceIfNeeded(task, this.instance.documentMap, (info) => {
      this.instance.store.upsertMany(info);
    });
  }

  /**
   * Executes recurrence for the provided task. This is a facade method that
   * delegates to TaskRecurrenceService.
   *
   * @param task The task to execute recurrence for
   */
  static executeRecurrenceForTask(task: DashboardTask): void {
    TaskRecurrenceService.executeRecurrenceForTask(task, this.instance.documentMap, (info) => {
      this.instance.store.upsertMany(info);
    });
  }

  protected setupSubscribers(): void {
    // Basic task things
    this.subscribers.push({
      afterMapSet(map) {
        // Check if any tasks need to recur after everything has been set
        Object.values(map).forEach((task) => {
          if (task) {
            TaskMapService.executeRecurrenceIfNeeded(task);
          }
        });
        TaskRecurrenceService.buildTaskRecurrenceSubMapFresh(map);
        TaskMapService.autoDeleteTasksPostSet(map);
      },
      beforeDocAddition(map, newDoc) {
        newDoc.description = newDoc.description || '';
        const parentTask = newDoc.parentTaskId ? map[newDoc.parentTaskId.toString()] : undefined;
        if (parentTask) {
          newDoc.userId = parentTask.userId;
        }
        return newDoc;
      },
      validateDocDeletion(map, docToDelete) {
        const docIdsToDelete: string[] = [docToDelete._id.toString()];
        const allTasks = TaskOperationsService.getAllTasks(map);
        docIdsToDelete.push(
          ...DashboardTaskService.getChildrenIds(allTasks, [docToDelete._id]).map((id) =>
            id.toString()
          )
        );
        return docIdsToDelete;
      },
      beforeDocDeletion(map, docToDelete) {
        TaskRecurrenceService.removeTaskTimeSubscription(docToDelete._id.toString());
      }
    });
    this.subscribers.push(TaskRecurrenceService.getSubscribersForTaskMap());
    this.subscribers.push(TaskTagsService.getSubscribersForTaskMap());
    this.subscribers.push(TaskSharingService.getSubscribersForTaskMap());
  }

  protected persistToLocalData(): DocumentMap<DashboardTask> {
    return LocalData.setAndGetTaskMap(this.documentMap);
  }
  protected getFromLocalData(): DocumentMap<DashboardTask> | null {
    return LocalData.taskMap;
  }
  protected persistToDb(updateInfo: DocumentInsertOrUpdateInfo<DashboardTask>): void {
    DashboardTaskAPIService.updateTasks(updateInfo);
  }

  static getDuplicateTaskUpdateInfo(
    taskId: string,
    newTaskUpdater: Updater<DashboardTask>,
    originalTaskUpdater?: Updater<DashboardTask>
  ): UpsertManyInfo<DashboardTask> {
    return TaskOperationsService.getDuplicateTaskUpdateInfo(
      this.instance.documentMap,
      taskId,
      newTaskUpdater,
      originalTaskUpdater
    );
  }

  /**
   * Gets the update info for a task and all of its children based on the
   * provided updater.
   *
   * @param taskId The ID of the parent task
   * @param updater Function to update each task
   */
  static getUpdateTaskAndAllChildrenInfo(
    taskId: string,
    updater: Updater<DashboardTask>
  ): UpsertManyInfo<DashboardTask> {
    return TaskOperationsService.getUpdateTaskAndAllChildrenInfo(
      this.instance.documentMap,
      taskId,
      updater
    );
  }

  /**
   * Auto-deletes tasks that are older than the user's auto task deletion
   * settings.
   *
   * @param map The task map to check for auto-deletion
   */
  private static autoDeleteTasksPostSet(map: DocumentMap<DashboardTask>) {
    // Check for any tasks that need to be auto-deleted.
    const userConfig = userSettings.get().config;
    if (userConfig.autoTaskDeletionDays < 5 || userConfig.autoTaskDeletionDays > 90) {
      console.error(
        `User ${userConfig.userId.toString()} has an invalid autoTaskDeletionDays ` +
          `value of ${userConfig.autoTaskDeletionDays}.`
      );
      return;
    }
    const dateThreshold = DateService.addDays(new Date(), -userConfig.autoTaskDeletionDays);
    // Only tasks that don't have a parent, aren't recurring,
    // are completed, and are older than the threshold
    const tasksToDelete = Object.values(map).filter((task) => {
      return (
        task &&
        task.userId.toString() === userConfig.userId.toString() &&
        task.completed &&
        !task.parentTaskId &&
        !task.parentRecurringTaskInfo &&
        !task.recurrenceInfo &&
        task.lastUpdatedDate < dateThreshold
      );
    }) as DashboardTask[];
    const taskIdsToDelete = tasksToDelete.map((task) => task._id.toString());
    if (taskIdsToDelete.length !== 0) {
      console.log(`Deleting ${taskIdsToDelete.length} tasks due to auto task deletion.`);
      this.getStore().deleteMany(taskIdsToDelete);
    }
  }
}
