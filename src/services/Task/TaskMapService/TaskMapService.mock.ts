import { userSettings } from '$stores/userSettings/userSettings';
import { DashboardTask, type DashboardTaskFilterAndSortResult } from '@aneuhold/core-ts-db-lib';
import type { ObjectId } from 'bson';
import TaskListService from '../TaskListService';
import { TaskMapService } from './TaskMapService';

/**
 * A mock provider for the TaskMapService. This depends on the backend API
 * being mocked already so it doesn't try to contact the server.
 */
export default class TaskMapServiceMock {
  constructor(private userId: ObjectId) {}

  reset(): void {
    TaskMapService.getStore().set({});
  }

  /**
   * Gets the sort and filter result for the current task list as if it was
   * at the top level.
   */
  get sortAndFilterResult() {
    return TaskListService.getTaskIds(TaskMapService.getMap(), userSettings.get(), 'default');
  }

  subscribeToSortAndFilterResult(
    callback: (sortAndFilterResult: DashboardTaskFilterAndSortResult) => void
  ) {
    return TaskMapService.getStore().subscribe(() => {
      callback(this.sortAndFilterResult);
    });
  }

  addTask(title: string) {
    const task = this.createTask(title);
    TaskMapService.getStore().addDoc(task);
    return task;
  }

  addTasks(numTasks: number): void {
    const tasks = this.createTasks(numTasks);
    TaskMapService.getStore().upsertMany({
      filter: () => true,
      updater: (doc) => doc,
      newDocs: tasks
    });
  }

  private createTasks(numTasks: number): DashboardTask[] {
    const tasks: DashboardTask[] = [];
    for (let i = 0; i < numTasks; i++) {
      tasks.push(this.createTask(`Test Task ${i + 1}`));
    }
    return tasks;
  }

  private createTask(title: string): DashboardTask {
    const task = new DashboardTask(this.userId);
    task.title = title;
    return task;
  }
}
