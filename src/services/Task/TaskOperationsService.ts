import {
  type DashboardTask,
  DashboardTaskService,
  type DocumentMap,
  DocumentService
} from '@aneuhold/core-ts-db-lib';
import { ObjectId } from 'bson';
import type { Updater } from 'svelte/store';
import type { UpsertManyInfo } from '../DocumentMapStoreService';

/**
 * A service for pure task operations that don't require store access.
 * This service contains utility functions for manipulating task data structures
 * and can be used by both TaskMapService and feature-specific services without
 * creating circular dependencies.
 */
export default class TaskOperationsService {
  /**
   * Gets the update info for a task and all of its children based on the
   * provided updater.
   *
   * @param taskMap The current task map
   * @param taskId The ID of the parent task
   * @param updater Function to update each task
   */
  static getUpdateTaskAndAllChildrenInfo(
    taskMap: DocumentMap<DashboardTask>,
    taskId: string,
    updater: Updater<DashboardTask>
  ): UpsertManyInfo<DashboardTask> {
    const parentTask = taskMap[taskId];
    if (!parentTask) {
      throw new Error(`Task with ID ${taskId} not found.`);
    }
    const allRelatedTaskIds = DashboardTaskService.getChildrenIds(this.getAllTasks(taskMap), [
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
   * Gets the update info for duplicating a task and all of its children.
   *
   * @param taskMap The current task map
   * @param taskId The ID of the task to duplicate
   * @param newTaskUpdater Function to update the new duplicated tasks
   * @param originalTaskUpdater Optional function to update the original tasks
   */
  static getDuplicateTaskUpdateInfo(
    taskMap: DocumentMap<DashboardTask>,
    taskId: string,
    newTaskUpdater: Updater<DashboardTask>,
    originalTaskUpdater?: Updater<DashboardTask>
  ): UpsertManyInfo<DashboardTask> {
    const parentTask = taskMap[taskId];
    if (!parentTask) {
      throw new Error(`Task with ID ${taskId} not found while trying to duplicate.`);
    }
    const allRelatedTaskIds = DashboardTaskService.getChildrenIds(this.getAllTasks(taskMap), [
      parentTask._id
    ]);
    allRelatedTaskIds.push(parentTask._id);
    const tasksToInsert: DashboardTask[] = [];
    const oldTaskIdToNewTaskId: { [oldId: string]: ObjectId } = {};
    allRelatedTaskIds.forEach((id) => {
      const doc = taskMap[id.toString()];
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
   * Simply gets all the tasks in the provided task map excluding any undefined.
   *
   * @param taskMap The task map to extract tasks from
   */
  static getAllTasks(taskMap: DocumentMap<DashboardTask>): DashboardTask[] {
    return Object.values(taskMap).filter((task): task is DashboardTask => task !== undefined);
  }
}
