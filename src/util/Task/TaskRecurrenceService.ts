import {
  DashboardTask,
  DashboardTaskService,
  RecurrenceBasis,
  RecurrenceEffect,
  type ParentRecurringTaskInfo,
  type RecurrenceInfo
} from '@aneuhold/core-ts-db-lib';
import { ObjectId } from 'bson';
import TaskService from './TaskService';

/**
 * A service for handling logic related to recurrence on tasks.
 */
export default class TaskRecurrenceService {
  /**
   * Creates an example of what would happen to a task if the recurrence
   * were to occur.
   */
  static createExampleOfRecurrence(
    startDate: Date | undefined,
    dueDate: Date | undefined,
    recurrenceInfo: RecurrenceInfo,
    parentRecurringTaskInfo?: ParentRecurringTaskInfo
  ): DashboardTask {
    const newTask = new DashboardTask(new ObjectId());
    newTask.startDate = startDate;
    newTask.dueDate = dueDate;
    newTask.recurrenceInfo = recurrenceInfo;
    newTask.parentRecurringTaskInfo = parentRecurringTaskInfo;
    this.updateDatesForRecurrence(newTask);
    return newTask;
  }

  /**
   * Executes recurrence for the provided task and all child tasks. This will
   * reflect across the stores, UI, and backend.
   *
   * This should only be triggered exactly when it is time to do so. The logic
   * for that should be contained elsewhere.
   *
   * This will not take any action if there is no recurrence info on the task.
   */
  static executeRecurrenceForTask(task: DashboardTask) {
    if (!task.recurrenceInfo) {
      return;
    }
    const taskMap = TaskService.getStore();
    if (task.recurrenceInfo.recurrenceEffect === RecurrenceEffect.stack && !task.completed) {
      taskMap.duplicateTask(
        task._id.toString(),
        (newTask) => {
          newTask.completed = false;
          this.updateDatesForRecurrence(newTask);
          return newTask;
        },
        (originalTask) => {
          originalTask.recurrenceInfo = undefined;
          originalTask.parentRecurringTaskInfo = undefined;
          return originalTask;
        }
      );
    } else {
      taskMap.updateTaskAndAllChildren(task._id.toString(), (task) => {
        this.updateDatesForRecurrence(task);
        task.completed = false;
        return task;
      });
    }
  }

  /**
   * Updates the provided Tasks's dates based on the recurrence info in-place.
   */
  private static updateDatesForRecurrence(task: DashboardTask): void {
    if (!task.recurrenceInfo) {
      return;
    }
    DashboardTaskService.updateDatesForRecurrence(task);
    if (task.recurrenceInfo.recurrenceEffect === RecurrenceEffect.rollOnCompletion) {
      const currentDate = new Date();
      if (task.recurrenceInfo.recurrenceBasis === RecurrenceBasis.startDate) {
        while (task.startDate && task.startDate < currentDate) {
          DashboardTaskService.updateDatesForRecurrence(task);
        }
      } else {
        while (task.dueDate && task.dueDate < currentDate) {
          DashboardTaskService.updateDatesForRecurrence(task);
        }
      }
    }
  }
}
