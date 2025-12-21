import type { DashboardTask } from '@aneuhold/core-ts-db-lib';
import type { DocumentMapStoreSubscriber } from '../DocumentMapStoreService.svelte';

/**
 * This is handled now?
 */
export default class TaskSharingService {
  static getSubscribersForTaskMap(): DocumentMapStoreSubscriber<DashboardTask> {
    return {
      beforeDocAddition(map, newDoc) {
        const parentTask = newDoc.parentTaskId ? map[newDoc.parentTaskId] : undefined;
        if (parentTask) {
          newDoc.sharedWith = [...parentTask.sharedWith];
        }
        return newDoc;
      }
    };
  }
}
