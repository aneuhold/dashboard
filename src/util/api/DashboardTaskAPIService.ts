import { APIService } from '@aneuhold/core-ts-api-lib';
import type { DashboardTask } from '@aneuhold/core-ts-db-lib';
import { snackbar } from 'components/Snackbar.svelte';
import LocalData from 'util/LocalData';
import { taskMap, type TaskMap } from '../../stores/taskMap';
import DashboardAPIService from './DashboardAPIService';

export type TaskInsertOrUpdateInfo = {
  insert?: DashboardTask[];
  update?: DashboardTask[];
  delete?: DashboardTask[];
};

/**
 * This service is used to insert or update tasks in the backend. It is
 * responsible for batching the requests and retrying if there is an error.
 *
 * It also stores the currently processing task and the task queue in local
 * storage so that the user can refresh the page and the tasks will still be
 * processed.
 */
export default class DashboardTaskAPIService {
  /**
   * Inserts, deletes, or updates tasks in the backend.
   *
   * If a set of tasks is already being inserted or updated, this will be added
   * to the queue and executed after the previous set is done.
   */
  static updateTasks(updateInfo: TaskInsertOrUpdateInfo) {
    // Add the task to the queue
    this.pushTaskQueueItem(updateInfo);

    // Start processing the queue if not already doing so
    if (!LocalData.currentTaskQueueItem) {
      this.processTaskQueue();
    }
  }

  static convertTaskArrayToMap(tasks: DashboardTask[]): TaskMap {
    return tasks.reduce((map, task) => {
      map[task._id.toString()] = task;
      return map;
    }, {} as TaskMap);
  }

  private static pushTaskQueueItem(updateInfo: TaskInsertOrUpdateInfo) {
    const taskQueue = LocalData.taskQueue;
    taskQueue.push(updateInfo);
    LocalData.taskQueue = taskQueue;
  }

  private static shiftTaskQueueItem(): TaskInsertOrUpdateInfo | undefined {
    const taskQueue = LocalData.taskQueue;
    const result = taskQueue.shift();
    LocalData.taskQueue = taskQueue;
    return result;
  }

  private static unshiftTaskQueueItem(updateInfo: TaskInsertOrUpdateInfo) {
    const taskQueue = LocalData.taskQueue;
    taskQueue.unshift(updateInfo);
    LocalData.taskQueue = taskQueue;
  }

  private static async processTaskQueue() {
    while (LocalData.taskQueue.length > 0) {
      LocalData.currentTaskQueueItem = this.shiftTaskQueueItem();
      const currentTask = LocalData.currentTaskQueueItem;
      if (!currentTask) {
        console.error('No current task to process, something went wrong!!');
      }
      let numProcessingAttempts = 0;

      const apiKeyValue = DashboardAPIService.checkOrSetupDashboardAPI();
      console.log('Processing task queue item', currentTask);
      const result = await APIService.callDashboardAPI({
        apiKey: apiKeyValue,
        options: {
          delete: {
            tasks: currentTask?.delete
          },
          insert: {
            tasks: currentTask?.insert
          },
          update: {
            tasks: currentTask?.update
          },
          get: {
            tasks: true
          }
        }
      });
      if (!result.success || !result.data?.tasks) {
        numProcessingAttempts += 1;
        console.error(`Error updating tasks. Attempt number ${numProcessingAttempts}`, result);
        if (numProcessingAttempts > 3) {
          snackbar.error('Error updating tasks');
          console.log(
            'This should eventually check the network connection and stop attempting' +
              ' until it is restored.'
          );
          break;
        }
        console.error('Error updating tasks', result);
        snackbar.error('Error updating tasks');
        numProcessingAttempts += 1;
        // Add the task back to the queue
        this.unshiftTaskQueueItem(LocalData.currentTaskQueueItem!);
      } else if (result.data.tasks && LocalData.taskQueue.length === 0) {
        // Only set the task map if there are no more tasks to process. This
        // should help prevent the task map from being set to an old value if
        // the user refreshes the page while the task queue is being processed.
        taskMap.set(this.convertTaskArrayToMap(result.data.tasks));
        LocalData.currentTaskQueueItem = undefined;
      }
      console.log('Finished processing task queue item', currentTask);
    }
  }
}
