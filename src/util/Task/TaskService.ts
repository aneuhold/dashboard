import { DashboardTask, DashboardTaskService, DocumentService } from '@aneuhold/core-ts-db-lib';
import { ObjectId } from 'bson';
import type { BreadCrumbArray } from 'components/BreadCrumb.svelte';
import { writable, type Updater, type Writable } from 'svelte/store';
import LocalData, { localDataReady } from '../LocalData';
import DashboardTaskAPIService from '../api/DashboardTaskAPIService';
import TaskRecurrenceService from './TaskRecurrenceService';

export type TaskMap = { [objectId: string]: DashboardTask };
export interface TaskStore extends Writable<DashboardTask> {
  /**
   * Sets the task without propogating the change to the backend or the
   * task map store. This should only be used from the task map store.
   */
  setWithoutPropogation: (newTask: DashboardTask) => void;
}
export type TaskStores = { [objectId: string]: TaskStore };

export default class TaskService {
  /**
   * The backing value of the taskMap.
   */
  private static _taskMap: TaskMap = {};

  private static taskMapStore: ReturnType<typeof TaskService.createTaskMapStore> | undefined;

  /**
   * The current task stores. This is used to ensure that we don't create
   * multiple stores for the same task.
   */
  private static currentTaskStores: TaskStores = {};
  private static taskTagsStore: Writable<string[]> | undefined;

  /**
   * The store which contains all tasks in the app. This will only trigger an
   * update when a task is removed or added, not when a task is updated.
   */
  static getStore() {
    if (!this.taskMapStore) {
      this.taskMapStore = this.createTaskMapStore();
    }
    return this.taskMapStore;
  }

  /**
   * Returns the task store for the given task ID. This will create a new
   * store if one does not already exist. This can be directly modified.
   *
   * If no task exists with that ID, it will throw an error.
   */
  static getTaskStore(taskId: string): TaskStore {
    if (!this.currentTaskStores[taskId]) {
      this.currentTaskStores[taskId] = this.createTaskStore(taskId);
    }
    return this.currentTaskStores[taskId];
  }

  static getTaskTagsStore() {
    if (!this.taskTagsStore) {
      this.taskTagsStore = writable<string[]>(this.getAllTaskTags());
    }
    return this.taskTagsStore;
  }

  static getTaskRoute(taskId: string, includeFirstSlash = true) {
    return `${includeFirstSlash ? '/' : ''}tasks?taskId=${taskId}`;
  }

  /**
   * Gets the appropriate route for the task category page for the given task.
   */
  static getTaskCategoryBreadCrumbs(taskId: string): BreadCrumbArray {
    const defaultBreadCrumbs = [{ name: 'tasks', link: 'tasks' }];
    const task = this._taskMap[taskId];
    if (!task) {
      return defaultBreadCrumbs;
    }
    switch (task.category) {
      case 'default':
        return defaultBreadCrumbs;
      default:
        return defaultBreadCrumbs;
    }
  }

  static getBreadCrumbArray(taskId: string): BreadCrumbArray {
    const task = this._taskMap[taskId];
    const breadCrumbs: BreadCrumbArray = [];
    if (!task)
      return [
        { name: 'tasks', link: 'tasks' },
        { name: 'Task not found', link: `link not needed` }
      ];
    breadCrumbs.push(...this.getTaskCategoryBreadCrumbs(taskId));
    let currentTask = task;
    const parentTaskChain: BreadCrumbArray = [];
    while (currentTask) {
      parentTaskChain.unshift({
        name: currentTask.title && currentTask.title !== '' ? currentTask.title : 'Untitled Task',
        link: this.getTaskRoute(currentTask._id.toString(), false)
      });
      if (!currentTask.parentTaskId) {
        break;
      }
      currentTask = this._taskMap[currentTask.parentTaskId.toString()];
    }
    breadCrumbs.push(...parentTaskChain);
    return breadCrumbs;
  }

  /**
   * Recursively finds the parent ID of the given task that has the same
   * sharedWith array.
   */
  static findParentIdWithSameSharedWith(task: DashboardTask): string {
    if (!task.parentTaskId || task.sharedWith.length === 0) {
      return task._id.toString();
    }
    const parentTask = this._taskMap[task.parentTaskId.toString()];
    if (!parentTask) {
      return task._id.toString();
    }
    // Fancy array comparison logic
    if (
      parentTask.sharedWith.length === task.sharedWith.length &&
      parentTask.sharedWith
        .map((id) => id.toString())
        .sort()
        .join() ===
        task.sharedWith
          .map((id) => id.toString())
          .sort()
          .join()
    ) {
      return this.findParentIdWithSameSharedWith(parentTask);
    }
    return task._id.toString();
  }

  static getTaskCategoryRoute(taskId: string, includeFirstSlash = true) {
    const defaultRoute = `${includeFirstSlash ? '/' : ''}tasks`;
    const task = this._taskMap[taskId];
    if (!task) {
      return defaultRoute;
    }
    switch (task.category) {
      case 'default':
        return defaultRoute;
      default:
        return defaultRoute;
    }
  }

  private static getAllTaskTags() {
    const allTaskTagsMap = Object.values(this._taskMap).reduce(
      (tags, task) => {
        task.tags.forEach((tag) => {
          tags[tag] = true;
        });
        return tags;
      },
      {} as Record<string, boolean>
    );
    return Object.keys(allTaskTagsMap);
  }

  private static updateTaskTags() {
    if (this.taskTagsStore) {
      this.taskTagsStore.set(this.getAllTaskTags());
    } else {
      this.taskTagsStore = writable<string[]>(this.getAllTaskTags());
    }
  }

  private static createTaskStore(taskId: string): TaskStore {
    const { subscribe, set } = writable(this._taskMap[taskId]);

    // Things that are watched for changes. Try to keep this light as possible.
    let previousTagsLength = this._taskMap[taskId].tags.length;
    let previousRecurrenceInfoString = JSON.stringify(this._taskMap[taskId].recurrenceInfo);
    let watchRecurenceInfo =
      !!this._taskMap[taskId].recurrenceInfo && !this._taskMap[taskId].parentRecurringTaskInfo;
    let previousStartDate = this._taskMap[taskId].startDate;
    let previousDueDate = this._taskMap[taskId].dueDate;
    let previousSharedWithLength = this._taskMap[taskId].sharedWith.length;

    /**
     * Handles all logic for updating properties on an individual task.
     *
     * Test how recurrenceInfo is updated, and if it is an entirely new object.
     */
    const updateTask = (updater: Updater<DashboardTask>) => {
      const newTask = updater(this._taskMap[taskId]);
      const newTagsLength = newTask.tags.length;

      // Handle updating the task tags. This happens no matter what because
      // it is separate from the task itself.
      if (previousTagsLength !== newTagsLength) {
        this.updateTaskTags();
        previousTagsLength = newTagsLength;
      }

      // Turn on watching if needed
      if (newTask.recurrenceInfo && !newTask.parentRecurringTaskInfo) {
        watchRecurenceInfo = true;
      }

      // Handle recurrence effect trigger
      if (watchRecurenceInfo && TaskRecurrenceService.taskShouldRecur(newTask)) {
        TaskRecurrenceService.executeRecurrenceForTask(newTask);
        return;
      }

      // Test if any of the changes should trigger child-task updates
      const sharedWithChanged = newTask.sharedWith.length !== previousSharedWithLength;
      if (watchRecurenceInfo || sharedWithChanged) {
        const newRecurrenceInfoString = JSON.stringify(newTask.recurrenceInfo);
        const recurrenceInfoChanged = newRecurrenceInfoString !== previousRecurrenceInfoString;
        const datesAreDifferent =
          newTask.startDate?.getTime() !== previousStartDate?.getTime() ||
          newTask.dueDate?.getTime() !== previousDueDate?.getTime();
        if (recurrenceInfoChanged || datesAreDifferent || sharedWithChanged) {
          // Make changes to task and all sub-tasks
          this.getStore().updateTaskAndAllChildren(taskId, (task) => {
            if (task._id.toString() === taskId) {
              return newTask;
            }
            // Child task updates
            if (newTask.recurrenceInfo) {
              task.parentRecurringTaskInfo = {
                taskId: newTask._id,
                startDate: newTask.startDate,
                dueDate: newTask.dueDate
              };
              task.recurrenceInfo = newTask.recurrenceInfo;
            } else {
              task.parentRecurringTaskInfo = undefined;
              task.recurrenceInfo = undefined;
            }
            // SharedWith should always be reflected down
            task.sharedWith = newTask.sharedWith;
            return task;
          });
          // Handle turning off watching if needed
          if (!newTask.recurrenceInfo || newTask.parentRecurringTaskInfo) {
            watchRecurenceInfo = false;
          }
          // Update all the previous values
          previousRecurrenceInfoString = newRecurrenceInfoString;
          previousStartDate = newTask.startDate;
          previousDueDate = newTask.dueDate;
          previousSharedWithLength = newTask.sharedWith.length;
          // Short-circuit the rest of the function
          return;
        }
      }

      // Update the info that alone, doesn't trigger child-task updates
      previousDueDate = newTask.dueDate;
      previousStartDate = newTask.startDate;

      // Handle normal singular task update
      this._taskMap[taskId] = newTask;
      set(this._taskMap[taskId]);
      LocalData.taskMap = this._taskMap;
      DashboardTaskAPIService.updateTasks({
        update: [this._taskMap[taskId]]
      });
    };

    return {
      subscribe,
      set: (newTask: DashboardTask) => {
        updateTask(() => newTask);
      },
      update: (updater: Updater<DashboardTask>) => {
        updateTask(updater);
      },
      setWithoutPropogation: (newTask: DashboardTask) => {
        set(newTask);
      }
    };
  }

  private static createTaskMapStore() {
    const { subscribe, set } = writable(this._taskMap);

    localDataReady.subscribe((ready) => {
      if (ready && LocalData.taskMap) {
        this._taskMap = LocalData.taskMap;
        set(LocalData.taskMap);
      }
    });

    const setTaskMap = () => {
      set(this._taskMap);
      LocalData.taskMap = this._taskMap;
      this.updateTaskTags();
    };

    return {
      subscribe,
      set: (newTaskMap: TaskMap) => {
        this._taskMap = newTaskMap;
        Object.entries(this.currentTaskStores).forEach(([taskId, store]) => {
          if (!this._taskMap[taskId]) {
            delete this.currentTaskStores[taskId];
          } else {
            store.setWithoutPropogation(this._taskMap[taskId]);
          }
        });
        setTaskMap();
        // Check if any tasks need to recur after everything has been set
        Object.values(this._taskMap).forEach((task) => {
          TaskRecurrenceService.executeRecurrenceIfNeeded(task);
        });
      },
      addTask: (newTask: DashboardTask) => {
        newTask.description = '';
        // Check for properties that must be shared with the parent and propogate.
        const parentTask = newTask.parentTaskId
          ? this._taskMap[newTask.parentTaskId.toString()]
          : null;
        if (parentTask) {
          newTask.sharedWith = [...parentTask.sharedWith];
          newTask.userId = parentTask.userId;
        }
        this._taskMap[newTask._id.toString()] = newTask;
        setTaskMap();
        DashboardTaskAPIService.updateTasks({
          insert: [newTask]
        });
      },
      duplicateTask: (
        taskId: string,
        newTaskUpdater: Updater<DashboardTask>,
        originalTaskUpdater?: Updater<DashboardTask>
      ) => {
        const parentTask = this._taskMap[taskId];
        const allRelatedTaskIds = DashboardTaskService.getChildrenIds(
          Object.values(this._taskMap),
          [parentTask._id]
        );
        allRelatedTaskIds.push(parentTask._id);
        const tasksToUpdate: DashboardTask[] = [];
        const tasksToInsert: DashboardTask[] = [];
        allRelatedTaskIds.forEach((id) => {
          let newTask = DocumentService.deepCopy(this._taskMap[id.toString()]);
          newTask._id = new ObjectId();
          newTask = newTaskUpdater(newTask);
          tasksToInsert.push(newTask);
          this._taskMap[newTask._id.toString()] = newTask;
        });
        if (originalTaskUpdater) {
          allRelatedTaskIds.forEach((id) => {
            const updatedTask = originalTaskUpdater(this._taskMap[id.toString()]);
            this._taskMap[id.toString()] = updatedTask;
            tasksToUpdate.push(updatedTask);
            const taskStore = this.currentTaskStores[id.toString()];
            if (taskStore) {
              taskStore.setWithoutPropogation(updatedTask);
            }
          });
        }
        setTaskMap();
        DashboardTaskAPIService.updateTasks({
          insert: tasksToInsert,
          update: tasksToUpdate
        });
      },
      deleteTask: (taskId: string) => {
        const allTasksToDelete: DashboardTask[] = [];
        allTasksToDelete.push(this._taskMap[taskId]);
        DashboardTaskService.getChildrenIds(Object.values(this._taskMap), [
          this._taskMap[taskId]._id
        ]).forEach((id) => {
          allTasksToDelete.push(this._taskMap[id.toString()]);
        });
        DashboardTaskAPIService.updateTasks({
          delete: allTasksToDelete
        });
        allTasksToDelete.forEach((task) => {
          delete this._taskMap[task._id.toString()];
          // Check and remove the store if needed
          if (this.currentTaskStores[task._id.toString()]) {
            delete this.currentTaskStores[task._id.toString()];
          }
        });
        setTaskMap();
      },
      updateTaskAndAllChildren: (taskId: string, updater: Updater<DashboardTask>) => {
        const parentTask = this._taskMap[taskId];
        const allTaskIdsToUpdate = DashboardTaskService.getChildrenIds(
          Object.values(this._taskMap),
          [parentTask._id]
        );
        allTaskIdsToUpdate.push(parentTask._id);
        const updateArray: DashboardTask[] = [];
        allTaskIdsToUpdate.forEach((taskId) => {
          const task = this._taskMap[taskId.toString()];
          const updatedTask = updater(task);
          this._taskMap[taskId.toString()] = updatedTask;
          updateArray.push(task);
          // Check and update the store if needed
          const taskStore = this.currentTaskStores[taskId.toString()];
          if (taskStore) {
            taskStore.setWithoutPropogation(task);
          }
        });
        setTaskMap();
        DashboardTaskAPIService.updateTasks({
          update: updateArray
        });
      }
    };
  }
}
