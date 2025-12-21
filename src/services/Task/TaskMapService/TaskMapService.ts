import {
  type DashboardTask,
  DashboardTaskService,
  type DocumentMap,
  type RecurrenceInfo
} from '@aneuhold/core-ts-db-lib';
import { DateService } from '@aneuhold/core-ts-lib';
import type { UUID } from 'crypto';
import type { Updater } from 'svelte/store';
import { userConfig } from '$stores/local/userConfig/userConfig';
import DashboardTaskAPIService from '$util/api/DashboardTaskAPIService';
import LocalData from '$util/LocalData/LocalData';
import { createLogger } from '$util/logging/logger';
import type {
  DocumentInsertOrUpdateInfo,
  DocumentMapStore,
  DocumentStore,
  UpsertManyInfo
} from '../../DocumentMapStoreService.svelte';
import DocumentMapStoreService from '../../DocumentMapStoreService.svelte';
import TaskCreationService from '../TaskCreationService';
import TaskOperationsService from '../TaskOperationsService';
import TaskRecurrenceService from '../TaskRecurrenceService';
import TaskTagsService from '../TaskTagsService';

const log = createLogger('TaskMapService.ts');

/**
 * The main task map service.
 */
export class TaskMapService extends DocumentMapStoreService<DashboardTask> {
  protected setupSubscribers(): void {
    // No subscribers needed for now
  }
  public override addDoc(task: DashboardTask): void {
    this.addManyDocs([task]);
  }

  public override addManyDocs(tasks: DashboardTask[]): void {
    const preparedTasks = tasks.map((task) =>
      TaskCreationService.prepareTaskForAddition(task, this.mapState)
    );
    super.addManyDocs(preparedTasks);
  }

  public override updateDoc(taskId: UUID, updater: Updater<DashboardTask>): void {
    this.updateManyDocs([taskId], updater);
  }

  public override updateManyDocs(
    filterOrTaskIds: UUID[] | ((currentDoc: DashboardTask) => boolean),
    updater: Updater<DashboardTask>
  ): void {
    super.updateManyDocs(filterOrTaskIds, updater);
  }

  public override upsertManyDocs(upsertInfo: UpsertManyInfo<DashboardTask>): void {
    const { filter, updater, newDocs } = upsertInfo;
    const preparedNewDocs = newDocs.map((task) =>
      TaskCreationService.prepareTaskForAddition(task, this.mapState)
    );
    super.upsertManyDocs({
      filter,
      updater: updater,
      newDocs: preparedNewDocs
    });
  }

  public override deleteDoc(docId: UUID): void {
    this.deleteManyDocs([docId]);
  }

  public override deleteManyDocs(docIds: UUID[]): void {
    const allTasks = TaskOperationsService.getAllTasks(this.mapState);
    const allIdsToDelete = [...docIds, ...DashboardTaskService.getChildrenIds(allTasks, docIds)];
    allIdsToDelete.forEach((id) => {
      TaskRecurrenceService.removeTaskTimeSubscription(id);
    });
    super.deleteManyDocs(allIdsToDelete);
  }

  public updateSharedWith(taskId: UUID, newSharedWith: UUID[]): void {
    const updateInfo = TaskOperationsService.getUpdateTaskAndAllChildrenInfo(
      this.mapState,
      taskId,
      (task) => {
        task.sharedWith = newSharedWith;
        return task;
      }
    );
    this.upsertManyDocs(updateInfo);
  }

  public updateTags(taskId: UUID, newTags: string[]): void {
    const userId = userConfig.get().config.userId;
    this.updateDoc(taskId, (task) => {
      if (newTags.length === 0) {
        delete task.tags[userId];
      } else {
        task.tags[userId] = newTags;
        // Add any new tags to the user's global tag list
        newTags.forEach((tag) => {
          TaskTagsService.addTagForUserIfNeeded(tag);
        });
      }
      return task;
    });
  }

  public updateTaskRecurrenceOrDates(
    taskId: UUID,
    options: {
      newRecurrenceInfo?: RecurrenceInfo | null;
      newStartDate?: Date | null;
      newDueDate?: Date | null;
    }
  ): void {
    const currentTask = this.mapState[taskId];
    if (!currentTask) {
      log.error(
        `Cannot update task recurrence for task with ID ${taskId} because it does not exist.`
      );
      return;
    }

    const { newRecurrenceInfo, newStartDate, newDueDate } = options;

    if (options.newRecurrenceInfo !== undefined) {
      currentTask.recurrenceInfo = newRecurrenceInfo;
    }
    if (options.newStartDate !== undefined) {
      currentTask.startDate = newStartDate;
    }
    if (options.newDueDate !== undefined) {
      currentTask.dueDate = newDueDate;
    }
    const watchRecurrenceInfo = currentTask.recurrenceInfo && !currentTask.parentRecurringTaskInfo;

    if (watchRecurrenceInfo && TaskRecurrenceService.taskShouldRecur(currentTask)) {
      const updateInfo = TaskRecurrenceService.getRecurrenceUpdateInfo(this.mapState, currentTask);
      this.upsertManyDocs(updateInfo);
    } else {
      TaskRecurrenceService.updateOrRemoveTaskTimeSubscription(currentTask);

      const updateInfo = TaskOperationsService.getUpdateTaskAndAllChildrenInfo(
        this.mapState,
        currentTask._id,
        (task) => {
          if (task._id === currentTask._id) {
            return task;
          }
          if (currentTask.recurrenceInfo) {
            task.parentRecurringTaskInfo = {
              taskId: currentTask._id,
              startDate: currentTask.startDate,
              dueDate: currentTask.dueDate
            };
            task.recurrenceInfo = currentTask.recurrenceInfo;
          } else {
            task.parentRecurringTaskInfo = null;
            task.recurrenceInfo = null;
          }
          return task;
        }
      );
      this.upsertManyDocs(updateInfo);
    }
  }

  public duplicateTask(taskId: UUID): void {
    const currentTask = this.mapState[taskId];
    if (!currentTask) {
      log.error(`Cannot duplicate task with ID ${taskId} because it does not exist.`);
      return;
    }
    const updateInfo = TaskOperationsService.getDuplicateTaskUpdateInfo(
      this.mapState,
      taskId,
      (task) => {
        // Conditional to find the original task that is being duplicated
        if (
          !task.parentTaskId ||
          (currentTask.parentTaskId && task.parentTaskId === currentTask.parentTaskId)
        ) {
          task.title = `${task.title} (Copy)`;
        }
        return task;
      }
    );
    this.upsertManyDocs(updateInfo);
  }

  public override setMap(newMap: DocumentMap<DashboardTask>): void {
    super.setMap(newMap);
    // Check if any tasks need to recur after everything has been set
    Object.values(newMap).forEach((task) => {
      if (task) {
        TaskMapService.executeRecurrenceIfNeeded(task);
      }
    });
    TaskRecurrenceService.buildTaskRecurrenceSubMapFresh(newMap);
    this.autoDeleteTasksPostSet(newMap);
  }

  // --- Legacy Methods / logic below -----

  private static instance = new TaskMapService();

  static getStore(): DocumentMapStore<DashboardTask> {
    return this.instance.store;
  }

  static getTaskStore(taskId: UUID): DocumentStore<DashboardTask> {
    return this.instance.getDocStore(taskId);
  }

  static getMap(): DocumentMap<DashboardTask> {
    return this.instance.documentMap;
  }

  /**
   * Adds a new task to the store.
   *
   * This method uses `TaskCreationService` to prepare the task (applying defaults,
   * inheritance, etc.) before adding it to the store.
   *
   * @param task The task to add.
   */
  static addTask(task: DashboardTask): void {
    const preparedTask = TaskCreationService.prepareTaskForAddition(
      task,
      this.instance.documentMap
    );
    this.instance.store.addDoc(preparedTask);
  }

  /**
   * Duplicates the task with the given ID.
   *
   * @param taskId The ID of the task to duplicate.
   */
  static duplicateTask(taskId: UUID): void {
    this.instance.duplicateTask(taskId);
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

  protected override persistToLocalData(): DocumentMap<DashboardTask> {
    return LocalData.setAndGetTaskMap(this.documentMap);
  }
  protected override getFromLocalData(): DocumentMap<DashboardTask> | null {
    return LocalData.taskMap;
  }
  protected override persistToDb(updateInfo: DocumentInsertOrUpdateInfo<DashboardTask>): void {
    DashboardTaskAPIService.updateTasks(updateInfo);
  }

  /**
   * Gets the update info for a task and all of its children based on the
   * provided updater.
   *
   * @param taskId The ID of the parent task
   * @param updater Function to update each task
   */
  static getUpdateTaskAndAllChildrenInfo(
    taskId: UUID,
    updater: Updater<DashboardTask>
  ): UpsertManyInfo<DashboardTask> {
    return TaskOperationsService.getUpdateTaskAndAllChildrenInfo(
      this.instance.documentMap,
      taskId,
      updater
    );
  }

  /**
   * Updates the sharedWith array for a task and propagates the change to all
   * children tasks.
   *
   * @param taskId The ID of the task to update
   * @param newSharedWith The new sharedWith array
   */
  static updateSharedWith(taskId: UUID, newSharedWith: UUID[]): void {
    const updateInfo = this.getUpdateTaskAndAllChildrenInfo(taskId, (task) => {
      task.sharedWith = newSharedWith;
      return task;
    });
    this.instance.upsertManyDocs(updateInfo);
  }

  /**
   * Updates the tags for a task for the current user.
   *
   * @param taskId The ID of the task to update
   * @param newTags The new tags array
   */
  static updateTags(taskId: UUID, newTags: string[]): void {
    const userId = userConfig.get().config.userId;
    const taskStore = this.getTaskStore(taskId);
    taskStore.update((task) => {
      if (newTags.length === 0) {
        delete task.tags[userId];
      } else {
        task.tags[userId] = newTags;
        // Add any new tags to the user's global tag list
        newTags.forEach((tag) => {
          TaskTagsService.addTagForUserIfNeeded(tag);
        });
      }
      return task;
    });
  }

  /**
   * Auto-deletes tasks that are older than the user's auto task deletion
   * settings.
   *
   * @param map The task map to check for auto-deletion
   */
  private autoDeleteTasksPostSet(map: DocumentMap<DashboardTask>) {
    // Check for any tasks that need to be auto-deleted.
    const userCfg = userConfig.get().config;
    if (userCfg.autoTaskDeletionDays < 5 || userCfg.autoTaskDeletionDays > 90) {
      log.error(
        `User ${userCfg.userId} has an invalid autoTaskDeletionDays value of ${userCfg.autoTaskDeletionDays}.`
      );
      return;
    }
    const dateThreshold = DateService.addDays(new Date(), -userCfg.autoTaskDeletionDays);
    // Only tasks that don't have a parent, aren't recurring,
    // are completed, and are older than the threshold
    const tasksToDelete = Object.values(map).filter((task) => {
      return (
        task &&
        task.userId === userCfg.userId &&
        task.completed &&
        !task.parentTaskId &&
        !task.parentRecurringTaskInfo &&
        !task.recurrenceInfo &&
        task.lastUpdatedDate < dateThreshold
      );
    }) as DashboardTask[];
    const taskIdsToDelete = tasksToDelete.map((task) => task._id);
    if (taskIdsToDelete.length !== 0) {
      log.info(`Deleting ${taskIdsToDelete.length} tasks due to auto task deletion.`);
      this.deleteManyDocs(taskIdsToDelete);
    }
  }
}

const taskMapService = new TaskMapService();
export default taskMapService;
