import type { DashboardTask } from '@aneuhold/core-ts-db-lib';
import { writable, type Updater, type Writable } from 'svelte/store';
import LocalData, { localDataReady } from './LocalData';
import DashboardTaskAPIService from './api/DashboardTaskAPIService';

export type TaskMap = { [objectId: string]: DashboardTask };
export type TaskStores = { [objectId: string]: Writable<DashboardTask> };

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
   */
  static getTaskStore(taskId: string) {
    if (!this.currentTaskStores[taskId]) {
      this.currentTaskStores[taskId] = this.createTaskStore(taskId);
    }
    return this.currentTaskStores[taskId];
  }

  private static createTaskStore(taskId: string): Writable<DashboardTask> {
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
