import { userSettings } from '$stores/userSettings';
import LocalData from '$util/LocalData/LocalData';
import DashboardTaskAPIService from '$util/api/DashboardTaskAPIService';
import {
  DashboardTaskService,
  DocumentService,
  type DashboardTask,
  type DocumentMap
} from '@aneuhold/core-ts-db-lib';
import { DateService } from '@aneuhold/core-ts-lib';
import { ObjectId } from 'bson';
import type { Updater } from 'svelte/store';
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

  static getMap(): DocumentMap<DashboardTask> {
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
        const allTasks = Object.values(map).filter((task) => task !== undefined) as DashboardTask[];
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
    const map = this.instance.documentMap;
    const parentTask = map[taskId];
    if (!parentTask) {
      throw new Error(`Task with ID ${taskId} not found while trying to duplicate.`);
    }
    const allRelatedTaskIds = DashboardTaskService.getChildrenIds(this.getAllTasks(map), [
      parentTask._id
    ]);
    allRelatedTaskIds.push(parentTask._id);
    const tasksToInsert: DashboardTask[] = [];
    const oldTaskIdToNewTaskId: { [oldId: string]: ObjectId } = {};
    allRelatedTaskIds.forEach((id) => {
      const doc = map[id.toString()];
      if (!doc) {
        throw new Error(`Task with ID ${id.toString()} not found while trying to duplicate.`);
      }
      let newTask = DocumentService.deepCopy(doc);
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

  /**
   * Gets the update info for a task and all of its children based on the
   * provided updater.
   */
  static getUpdateTaskAndAllChildrenInfo(
    taskId: string,
    updater: Updater<DashboardTask>
  ): UpsertManyInfo<DashboardTask> {
    const map = this.instance.documentMap;
    const parentTask = map[taskId];
    if (!parentTask) {
      throw new Error(`Task with ID ${taskId} not found.`);
    }
    const allRelatedTaskIds = DashboardTaskService.getChildrenIds(TaskMapService.getAllTasks(map), [
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

  /**
   * Simply gets all the tasks in the provided task map excluding any undefined.
   */
  private static getAllTasks(map: DocumentMap<DashboardTask>) {
    return Object.values(map).filter((task) => task !== undefined) as DashboardTask[];
  }
}
