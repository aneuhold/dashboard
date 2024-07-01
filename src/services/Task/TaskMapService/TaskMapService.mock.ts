import { userSettings } from '$stores/userSettings/userSettings';
import { DashboardTask, type DashboardTaskFilterAndSortResult } from '@aneuhold/core-ts-db-lib';
import type { ObjectId } from 'bson';
import TaskListService from '../TaskListService';
import { TaskMapService } from './TaskMapService';

type AddTaskInfo = {
  title: string;
  startDate?: Date;
  dueDate?: Date;
};

type AddTasksInfo = {
  numTasks: number;
  includeStartDates?: boolean;
  includeStartDatesInFuture?: boolean;
  includeDueDates?: boolean;
  /**
   * If set to true, it will make half of the due dates overdue.
   */
  includeOverDueDates?: boolean;
};

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

  addTask(options: AddTaskInfo): DashboardTask {
    const task = this.createTask(options);
    TaskMapService.getStore().addDoc(task);
    return task;
  }

  addTasks(options: AddTasksInfo): void {
    const tasks = this.createTasks(options);
    TaskMapService.getStore().upsertMany({
      filter: () => true,
      updater: (doc) => doc,
      newDocs: tasks
    });
  }

  private createTasks(options: AddTasksInfo): DashboardTask[] {
    const tasks: DashboardTask[] = [];
    for (let i = 0; i < options.numTasks; i++) {
      // Initialize task info with title
      const taskInfo: AddTaskInfo = { title: `Test Task ${i + 1}` };

      // If includeStartDates is true, randomly decide to add a start date to half of the tasks
      if ((options.includeStartDates || options.includeStartDatesInFuture) && Math.random() < 0.5) {
        const pastDays = Math.floor(Math.random() * 30);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - pastDays);
        taskInfo.startDate = startDate;
      }

      // If includeStartDatesInFuture is true, randomly decide to make tasks
      // with an existing start date to be in the future
      if (options.includeStartDatesInFuture && taskInfo.startDate && Math.random() < 0.5) {
        const futureDays = Math.floor(Math.random() * 30 + 1);
        const newStartDate = new Date();
        newStartDate.setDate(newStartDate.getDate() + futureDays);
        taskInfo.startDate = newStartDate;
      }

      // If includeDueDates is true, randomly decide to add a due date to half of the tasks
      if ((options.includeDueDates || options.includeOverDueDates) && Math.random() < 0.5) {
        const futureDays = Math.floor(Math.random() * 30 + 1);
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + futureDays);
        taskInfo.dueDate = dueDate;
      }

      // If includeOverDueDates is true, randomly decide to make tasks with
      // an existing due date to be in the past
      // Update this with GitHub copilot to allow for some in-between to work
      // between the existing start date and the due date.
      if (
        options.includeOverDueDates &&
        taskInfo.dueDate &&
        !taskInfo.startDate &&
        Math.random() < 0.5
      ) {
        const pastDays = Math.floor(Math.random() * 30);
        taskInfo.dueDate.setDate(taskInfo.dueDate.getDate() - pastDays);
      }

      tasks.push(this.createTask(taskInfo));
    }
    return tasks;
  }

  private createTask(options: AddTaskInfo): DashboardTask {
    const task = new DashboardTask(this.userId);
    task.title = options.title;
    task.startDate = options.startDate;
    task.dueDate = options.dueDate;
    return task;
  }
}
