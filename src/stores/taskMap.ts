import type { DashboardTask } from '@aneuhold/core-ts-db-lib';
import { writable } from 'svelte/store';
import DashboardTaskAPIService from 'util/api/DashboardTaskAPIService';
import LocalData, { localDataReady } from '../util/LocalData';

export type TaskMap = { [objectId: string]: DashboardTask };

/**
 * This should be updated so that it can be used with the update function and
 * automatically updates the backend perhaps.
 */
function createTaskMapStore() {
  const { subscribe, update, set } = writable<TaskMap>({});

  localDataReady.subscribe((ready) => {
    if (ready && LocalData.taskMap) {
      set(LocalData.taskMap);
    }
  });

  return {
    subscribe,
    set: (newTaskList: TaskMap) => {
      set(newTaskList);
      LocalData.taskMap = newTaskList;
    },
    addTask: (newTask: DashboardTask) => {
      update((currentTaskMap) => {
        currentTaskMap[newTask._id.toString()] = newTask;
        LocalData.taskMap = currentTaskMap;
        DashboardTaskAPIService.updateTasks({
          insert: [newTask]
        });
        return currentTaskMap;
      });
    },
    deleteTask: (objectId: string) => {
      update((currentTaskMap) => {
        DashboardTaskAPIService.updateTasks({
          delete: [currentTaskMap[objectId]]
        });
        delete currentTaskMap[objectId];
        LocalData.taskMap = currentTaskMap;
        return currentTaskMap;
      });
    },
    updateTask: (updatedTask: DashboardTask) => {
      update((currentTaskMap) => {
        DashboardTaskAPIService.updateTasks({
          update: [updatedTask]
        });
        currentTaskMap[updatedTask._id.toString()] = updatedTask;
        LocalData.taskMap = currentTaskMap;
        return currentTaskMap;
      });
    }
  };
}

export const taskMap = createTaskMapStore();
