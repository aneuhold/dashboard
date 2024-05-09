import LocalData from '$util/LocalData';
import DashboardTaskAPIService from '$util/api/DashboardTaskAPIService';
import {
  DashboardTaskService,
  DocumentService,
  type DashboardTask
} from '@aneuhold/core-ts-db-lib';
import { DateService } from '@aneuhold/core-ts-lib';
import { ObjectId } from 'bson';
import type { Updater } from 'svelte/store';
import { userSettings } from '../../stores/userSettings';
import type {
  DocumentInsertOrUpdateInfo,
  DocumentMapStore,
  DocumentStore,
  UpsertManyInfo
} from '../DocumentMapStoreService';
import DocumentMapStoreService from '../DocumentMapStoreService';
import TaskRecurrenceService from './TaskRecurrenceService';
import TaskSharingService from './TaskSharingService';
import TaskTagsService from './TaskTagsService';

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

  static getMap(): Record<string, DashboardTask> {
    return this.instance.documentMap;
  }

  protected setupSubscribers(): void {
    // Basic task things
    this.subscribers.push({
      afterMapSet(map) {
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
        docIdsToDelete.push(
          ...DashboardTaskService.getChildrenIds(Object.values(map), [docToDelete._id]).map((id) =>
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

  protected persistToLocalData(): Record<string, DashboardTask> {
    return LocalData.setAndGetTaskMap(this.documentMap);
  }
  protected getFromLocalData(): Record<string, DashboardTask> | null {
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
    const map = this.instance.documentMap;
    const parentTask = map[taskId];
    const allRelatedTaskIds = DashboardTaskService.getChildrenIds(Object.values(map), [
      parentTask._id
    ]);
    allRelatedTaskIds.push(parentTask._id);
    const tasksToInsert: DashboardTask[] = [];
    const oldTaskIdToNewTaskId: { [oldId: string]: ObjectId } = {};
    allRelatedTaskIds.forEach((id) => {
      let newTask = DocumentService.deepCopy(map[id.toString()]);
      newTask._id = new ObjectId();
      oldTaskIdToNewTaskId[id.toString()] = newTask._id;
      newTask = newTaskUpdater(newTask);
      tasksToInsert.push(newTask);
    });
    // Map back through and update parent task IDs. Don't update the
    // original task though, as that should retain it's current parent.
    tasksToInsert.forEach((task) => {
      if (task.parentTaskId && task._id.toString() !== taskId) {
        task.parentTaskId = oldTaskIdToNewTaskId[task.parentTaskId.toString()];
      }
    });
    // The below could be made into something more performant
    const allRelatedTaskIdStrings = allRelatedTaskIds.map((id) => id.toString());
    if (originalTaskUpdater) {
      const filter = (task: DashboardTask) => allRelatedTaskIdStrings.includes(task._id.toString());
      const updater = originalTaskUpdater;
      return {
        filter: filter,
        updater: updater,
        newDocs: tasksToInsert
      };
    }
    return {
      filter: () => false,
      updater: (task) => task,
      newDocs: tasksToInsert
    };
  }

  static getUpdateTaskAndAllChildrenInfo(
    taskId: string,
    updater: Updater<DashboardTask>
  ): UpsertManyInfo<DashboardTask> {
    const map = this.instance.documentMap;
    const parentTask = map[taskId];
    const allRelatedTaskIds = DashboardTaskService.getChildrenIds(Object.values(map), [
      parentTask._id
    ]);
    allRelatedTaskIds.push(parentTask._id);
    const allRelatedTaskIdStrings = allRelatedTaskIds.map((id) => id.toString());
    return {
      filter: (currentDoc) => allRelatedTaskIdStrings.includes(currentDoc._id.toString()),
      updater,
      newDocs: []
    };
  }

  /**
   * Auto-deletes tasks that are older than the user's auto task deletion
   * settings.
   */
  private static autoDeleteTasksPostSet(map: Record<string, DashboardTask>) {
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
    const taskIdsToDelete = Object.values(map)
      .filter((task) => {
        return (
          task.userId.toString() === userConfig.userId.toString() &&
          task.completed &&
          !task.parentTaskId &&
          !task.parentRecurringTaskInfo &&
          !task.recurrenceInfo &&
          task.lastUpdatedDate < dateThreshold
        );
      })
      .map((task) => task._id.toString());
    if (taskIdsToDelete.length !== 0) {
      console.log(`Deleting ${taskIdsToDelete.length} tasks due to auto task deletion.`);
      this.getStore().deleteMany(taskIdsToDelete);
    }
  }
}
