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
import type { Unsubscriber, Updater } from 'svelte/store';
import DashboardAPIService from 'util/api/DashboardAPIService';
import { appIsVisible } from '../../stores/appIsVisible';
import { timeMinute } from '../../stores/timeMinute';
import TaskService, { type TaskMap } from './TaskService';

type TaskRecurrenceSubMap = { [taskId: string]: Unsubscriber };

/**
 * A service for handling logic related to recurrence on tasks.
 */
export default class TaskRecurrenceService {
  /**
   * The map of task IDs to the their associated unsubscriber. The unsubscriber
   * comes from subscribing to the {@link timeMinute} store.
   */
  private static taskRecurrenceSubMap: TaskRecurrenceSubMap = {};

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
   * This should only be called by the taskMap store when it is updated.
   */
  static buildTaskRecurrenceSubMapFresh(taskMap: TaskMap): void {
    // Clear the current map
    Object.values(this.taskRecurrenceSubMap).forEach((unsub) => unsub());
    this.taskRecurrenceSubMap = {};
    // Build the new map
    Object.values(taskMap).forEach((task) => {
      this.updateOrRemoveTaskTimeSubscription(task);
    });
  }

  /**
   * Attaches the provided task to the timeMinute store if it is not already
   * attached, and if it fits the conditions to be attached.
   *
   * This will also remove the task from the timeMinute store if it is attached
   * and no longer fits the conditions to be attached.
   *
   * This should be called whenever a task's recurrence info is updated.
   */
  static updateOrRemoveTaskTimeSubscription(task: DashboardTask) {
    // Remove the current subscription if it exists
    this.removeTaskTimeSubscription(task._id.toString());
    if (
      !task.parentRecurringTaskInfo &&
      task.recurrenceInfo &&
      task.recurrenceInfo.recurrenceEffect !== RecurrenceEffect.rollOnCompletion
    ) {
      const nextRecurrenceDate = this.getNextRecurrenceDate(task);
      if (nextRecurrenceDate) {
        this.taskRecurrenceSubMap[task._id.toString()] = timeMinute.subscribe((newDate) => {
          if (newDate > nextRecurrenceDate) {
            // Only run if the app is visible, otherwise, wait until it is
            // visible.
            if (appIsVisible.get()) {
              // The decision was made to pull all tasks from the DB first before
              // triggering recurrence. This is because it could be left open
              // for a long time and updates sent to the backend could be stale.
              DashboardAPIService.getInitialDataIfNeeded();
            }
          }
        });
      }
    }
  }

  static removeTaskTimeSubscription(taskId: string) {
    if (this.taskRecurrenceSubMap[taskId]) {
      this.taskRecurrenceSubMap[taskId]();
      delete this.taskRecurrenceSubMap[taskId];
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
