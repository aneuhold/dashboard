import { userSettings } from '$stores/userSettings/userSettings';
import SBMockData from '$storybook/globalMockData';
import { DashboardTask, type DashboardTaskFilterAndSortResult } from '@aneuhold/core-ts-db-lib';
import type { ObjectId } from 'bson';
import TaskListService from '../TaskListService';
import TaskTagsService from '../TaskTagsService';
import { TaskMapService } from './TaskMapService';

type AddTaskInfo = {
  title: string;
  startDate?: Date;
  dueDate?: Date;
  sharedWith?: MockTaskSharedWith;
  description?: MockTaskDescription;
  assignedTo?: MockTaskAssignment;
  tags?: string[];
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
  sharedWith?: MockTaskSharedWith;
  tags?: string[];
  descriptions?: MockTaskDescription;
};

/**
 * Represents the different ways a task can be shared with others in the mock.
 */
export enum MockTaskSharedWith {
  none,
  withMe,
  withMultiplePeople,
  withSinglePerson
}

export enum MockTaskAssignment {
  none,
  toMe,
  toOther
}

export enum MockTaskDescription {
  none,
  short,
  long
}

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
      const taskInfo: AddTaskInfo = {
        title: `Test Task ${i + 1}`,
        sharedWith: options.sharedWith,
        tags: options.tags,
        description: options.descriptions
      };

      // Decide on start date
      if (options.includeStartDates || options.includeStartDatesInFuture) {
        if (Math.random() < 0.5) {
          taskInfo.startDate = this.getRandomDate(30, options.includeStartDatesInFuture ?? false);
        }
      }

      // Decide on due date
      if (options.includeDueDates || options.includeOverDueDates) {
        if (Math.random() < 0.5) {
          taskInfo.dueDate = this.getRandomDate(30, !options.includeOverDueDates);
        }
      }

      // Adjust due date if it should be between the start date and now
      if (
        options.includeOverDueDates &&
        taskInfo.dueDate &&
        taskInfo.startDate &&
        Math.random() < 0.5
      ) {
        const startDate = taskInfo.startDate.getTime();
        const now = Date.now();
        const timeDiff = now - startDate;
        if (timeDiff > 0) {
          // Set due date to a random time between start date and now
          taskInfo.dueDate = new Date(startDate + Math.random() * timeDiff);
        }
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

    // tags setup
    task.tags = { [this.userId.toString()]: options.tags ?? [] };
    options.tags?.forEach((tag) => {
      TaskTagsService.addTagForUser(tag);
    });

    // sharedWith setup
    task.sharedWith = [];
    switch (options.sharedWith ? options.sharedWith : MockTaskSharedWith.none) {
      case MockTaskSharedWith.none:
        break;
      case MockTaskSharedWith.withMe:
        task.sharedWith.push(SBMockData.currentUserCto._id);
        task.userId = SBMockData.collaborator1._id;
        break;
      case MockTaskSharedWith.withSinglePerson:
        task.sharedWith.push(SBMockData.collaborator1._id);
        break;
      case MockTaskSharedWith.withMultiplePeople:
        task.sharedWith.push(SBMockData.collaborator1._id, SBMockData.collaborator2._id);
        break;
    }

    // assignedTo setup
    switch (options.assignedTo ? options.assignedTo : MockTaskAssignment.none) {
      case MockTaskAssignment.none:
        break;
      case MockTaskAssignment.toMe:
        task.assignedTo = SBMockData.currentUserCto._id;
        break;
      case MockTaskAssignment.toOther:
        task.assignedTo = SBMockData.collaborator1._id;
        break;
    }

    // description setup
    switch (options.description ? options.description : MockTaskDescription.none) {
      case MockTaskDescription.none:
        break;
      case MockTaskDescription.short:
        task.description = 'This is a short description.';
        break;
      case MockTaskDescription.long:
        task.description =
          'This is a long description. It contains more details about the task, its objectives, and how it should be accomplished.\nThis might include links to resources, expected outcomes, and any other relevant information that can help in the completion of the task.';
        break;
    }

    return task;
  }

  private getRandomDate(days: number, future: boolean): Date {
    const date = new Date();
    const modifier = future ? 1 : -1;
    date.setDate(date.getDate() + modifier * Math.floor(Math.random() * days + 1));
    return date;
  }
}
