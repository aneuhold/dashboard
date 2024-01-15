import {
  DashboardTask,
  DashboardTaskService,
  DocumentService,
  RecurrenceBasis,
  RecurrenceEffect,
  type ParentRecurringTaskInfo,
  type RecurrenceInfo
} from '@aneuhold/core-ts-db-lib';
import { ObjectId } from 'bson';
import type { Updater } from 'svelte/store';
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
   * Executes recurrence for the provided task if it is time to do so. Only
   * executes for the top-level recurring task and not child tasks, because
   * child tasks are handled by the parent task.
   */
  static executeRecurrenceIfNeeded(task: DashboardTask) {
    if (this.taskShouldRecur(task)) {
      this.executeRecurrenceForTask(task);
    }
  }

  static taskShouldRecur(task: DashboardTask): boolean {
    // Do not execute recurrence for child tasks or if the recurrenceInfo is
    // not set.
    if (!task.recurrenceInfo || task.parentRecurringTaskInfo) {
      return false;
    }
    if (
      task.recurrenceInfo.recurrenceEffect === RecurrenceEffect.rollOnCompletion &&
      task.completed
    ) {
      return true;
    } else {
      const nextRecurreceDate = this.getNextRecurrenceDate(task);
      if (!nextRecurreceDate) {
        return false;
      }
      const currentDate = new Date();
      if (nextRecurreceDate < currentDate) {
        return true;
      }
    }
    return false;
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
    if (!task.recurrenceInfo || task.parentRecurringTaskInfo) {
      return;
    }
    console.log('Executing recurrence for task', task);
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
   * Gets the next recurrence date for the provided task.
   *
   * This returns a value for parent and sub tasks.
   */
  static getNextRecurrenceDate(task: DashboardTask): Date | null {
    if (
      !task.recurrenceInfo ||
      task.recurrenceInfo.recurrenceEffect === RecurrenceEffect.rollOnCompletion
    ) {
      return null;
    }
    let basisDate: Date | undefined;
    if (task.parentRecurringTaskInfo) {
      if (task.recurrenceInfo.recurrenceBasis === RecurrenceBasis.startDate) {
        basisDate = task.parentRecurringTaskInfo.startDate;
      } else {
        return task.parentRecurringTaskInfo.dueDate || null;
      }
    } else {
      if (task.recurrenceInfo.recurrenceBasis === RecurrenceBasis.startDate) {
        basisDate = task.startDate;
      } else {
        return task.dueDate || null;
      }
    }
    if (!basisDate) {
      return null;
    }
    return DashboardTaskService.getNextFrequencyDate(basisDate, task.recurrenceInfo.frequency);
  }

  /**
   * Gets a simulated next recurrence date for the provided task. This makes
   * a deep copy of the task first. If anything is invalid, or the task recurs
   * on completion, this will return null.
   */
  static getSimulatedRecurrenceDate(
    originalTask: DashboardTask,
    updater: Updater<DashboardTask>
  ): Date | null {
    let taskCopy = DocumentService.deepCopy(originalTask);
    taskCopy = updater(taskCopy);
    return this.getNextRecurrenceDate(taskCopy);
  }

  /**
   * Updates the provided Tasks's dates based on the recurrence info in-place.
   */
  private static updateDatesForRecurrence(task: DashboardTask): void {
    if (!task.recurrenceInfo) {
      return;
    }
    DashboardTaskService.updateDatesForRecurrence(task);
    // For both roll on basis and roll on copmletion, the tasks should move
    // forward until they are in the future.
    if (task.recurrenceInfo.recurrenceEffect !== RecurrenceEffect.stack) {
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
