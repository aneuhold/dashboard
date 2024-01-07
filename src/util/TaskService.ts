import type { DashboardTask } from '@aneuhold/core-ts-db-lib';
import type { BreadCrumbArray } from 'components/BreadCrumb.svelte';
import { writable, type Updater, type Writable } from 'svelte/store';
import LocalData, { localDataReady } from './LocalData';
import DashboardTaskAPIService from './api/DashboardTaskAPIService';

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

  private static createTaskStore(taskId: string): TaskStore {
    const { subscribe, set } = writable(this._taskMap[taskId]);
    const setTask = () => {
      set(this._taskMap[taskId]);
      LocalData.taskMap = this._taskMap;
      DashboardTaskAPIService.updateTasks({
        update: [this._taskMap[taskId]]
      });
    };

    return {
      subscribe,
      set: (newTask: DashboardTask) => {
        this._taskMap[taskId] = newTask;
        setTask();
      },
      update: (updater: Updater<DashboardTask>) => {
        const updatedTask = updater(this._taskMap[taskId]);
        this._taskMap[taskId] = updatedTask;
        setTask();
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
      },
      addTask: (newTask: DashboardTask) => {
        this._taskMap[newTask._id.toString()] = newTask;
        setTaskMap();
        DashboardTaskAPIService.updateTasks({
          insert: [newTask]
        });
      },
      deleteTask: (objectId: string) => {
        DashboardTaskAPIService.updateTasks({
          delete: [{ ...this._taskMap[objectId] }]
        });
        delete this._taskMap[objectId];
        setTaskMap();
      }
    };
  }
}
