import type { ProjectDashboardOptions } from '@aneuhold/core-ts-api-lib';
import type { DashboardTask } from '@aneuhold/core-ts-db-lib';
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
    const request: ProjectDashboardOptions = {};
    if (updateInfo.insert && updateInfo.insert.length > 0) {
      request.insert = {
        tasks: updateInfo.insert
      };
    }
    if (updateInfo.update && updateInfo.update.length > 0) {
      request.update = {
        tasks: updateInfo.update
      };
    }
    if (updateInfo.delete && updateInfo.delete.length > 0) {
      request.delete = {
        tasks: updateInfo.delete
      };
    }
    request.get = {
      tasks: true
    };
    DashboardAPIService.queryApi(request);
  }
}
