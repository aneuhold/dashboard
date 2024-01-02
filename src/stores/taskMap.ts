import type { DashboardTask } from '@aneuhold/core-ts-db-lib';
import { writable } from 'svelte/store';
import LocalData, { localDataReady } from '../util/LocalData';

export type TaskMap = { [objectId: string]: DashboardTask };

function createTaskMapStore() {
  const { subscribe, set } = writable<TaskMap>({});

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
    }
  };
}

export const taskMap = createTaskMapStore();
