import {
  DashboardTaskService,
  DocumentService,
  type DashboardTask
} from '@aneuhold/core-ts-db-lib';
import { ObjectId } from 'bson';
import type { Updater } from 'svelte/store';
import LocalData from 'util/LocalData';
import TaskRecurrenceService from 'util/Task/TaskRecurrenceService';
import TaskTagsService from 'util/Task/TaskTagsService';
import DashboardTaskAPIService from 'util/api/DashboardTaskAPIService';
import type {
  DocumentInsertOrUpdateInfo,
  DocumentMapStore,
  DocumentStore,
  UpsertManyInfo
} from '../DocumentMapStoreService';
import DocumentMapStoreService from '../DocumentMapStoreService';

/**
 * The main task map service.
 */
export class TaskMapService extends DocumentMapStoreService<DashboardTask> {
  private static instance: TaskMapService;

  private constructor() {
    super();
  }

  static getStore(): DocumentMapStore<DashboardTask> {
    return this.getInstance().store;
  }

  static getTaskStore(taskId: string): DocumentStore<DashboardTask> {
    return this.getInstance().getDocStore(taskId);
  }

  static getMap(): Record<string, DashboardTask> {
    return this.getInstance().documentMap;
  }

  protected setupSubscribers(): void {
    // Basic task things
    this.subscribers.push({
      beforeDocAddition(map, newDoc) {
        newDoc.description = newDoc.description || '';
        const parentTask = newDoc.parentTaskId ? map[newDoc.parentTaskId.toString()] : undefined;
        if (parentTask) {
          newDoc.sharedWith = [...parentTask.sharedWith];
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
    // Recurrence things
    this.subscribers.push(TaskRecurrenceService.getSubscribersForTaskMap());
    // Tag things
    this.subscribers.push({
      beforeDocUpdate(map, oldDoc, newDoc) {
        if (oldDoc?.tags.length !== newDoc.tags.length) {
          TaskTagsService.updateTaskTagsStore();
        }
        return newDoc;
      }
    });
    // Shared with things
    this.subscribers.push({
      validateDocUpdate(map, oldDoc, newDoc) {
        if (oldDoc?.sharedWith.length !== newDoc.sharedWith.length) {
          return TaskMapService.getUpdateTaskAndAllChildrenInfo(newDoc._id.toString(), (task) => {
            task.sharedWith = newDoc.sharedWith;
            return task;
          });
        }
        return null;
      }
    });
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

  private static getInstance() {
    if (!this.instance) {
      this.instance = new TaskMapService();
    }
    return this.instance;
  }

  static getDuplicateTaskUpdateInfo(
    taskId: string,
    newTaskUpdater: Updater<DashboardTask>,
    originalTaskUpdater?: Updater<DashboardTask>
  ): UpsertManyInfo<DashboardTask> {
    const map = this.getInstance().documentMap;
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
    const map = this.getInstance().documentMap;
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
}
