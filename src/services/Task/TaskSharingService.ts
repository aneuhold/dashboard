import type { DashboardTask } from '@aneuhold/core-ts-db-lib';
import type { DocumentMapStoreSubscriber } from '../DocumentMapStoreService';
import { TaskMapService } from './TaskMapService';

export default class TaskSharingService {
  static getSubscribersForTaskMap(): DocumentMapStoreSubscriber<DashboardTask> {
    return {
      beforeDocAddition(map, newDoc) {
        const parentTask = newDoc.parentTaskId ? map[newDoc.parentTaskId.toString()] : undefined;
        if (parentTask) {
          newDoc.sharedWith = [...parentTask.sharedWith];
        }
        return newDoc;
      },
      validateDocUpdate(map, oldDoc, newDoc) {
        if (oldDoc?.sharedWith.length !== newDoc.sharedWith.length) {
          return TaskMapService.getUpdateTaskAndAllChildrenInfo(newDoc._id.toString(), (task) => {
            task.sharedWith = newDoc.sharedWith;
            return task;
          });
        }
        return null;
      }
    };
  }
}
