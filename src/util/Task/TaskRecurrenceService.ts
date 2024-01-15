import {
  DashboardTask,
  DashboardTaskService,
  RecurrenceBasis,
  RecurrenceEffect,
  type ParentRecurringTaskInfo,
  type RecurrenceInfo
} from '@aneuhold/core-ts-db-lib';
import { ObjectId } from 'bson';

export default class TaskRecurrenceService {
  static createExampleOfRecurrence(
    startDate: Date | undefined,
    dueDate: Date | undefined,
    recurrenceInfo: RecurrenceInfo,
    parentRecurringTaskInfo?: ParentRecurringTaskInfo
  ) {
    const newTask = new DashboardTask(new ObjectId());
    newTask.startDate = startDate;
    newTask.dueDate = dueDate;
    newTask.recurrenceInfo = recurrenceInfo;
    newTask.parentRecurringTaskInfo = parentRecurringTaskInfo;
    DashboardTaskService.updateDatesForRecurrence(newTask);
    if (recurrenceInfo.recurrenceEffect === RecurrenceEffect.rollOnCompletion) {
      const currentDate = new Date();
      if (recurrenceInfo.recurrenceBasis === RecurrenceBasis.startDate) {
        while (newTask.startDate && newTask.startDate < currentDate) {
          DashboardTaskService.updateDatesForRecurrence(newTask);
        }
      } else {
        while (newTask.dueDate && newTask.dueDate < currentDate) {
          DashboardTaskService.updateDatesForRecurrence(newTask);
        }
      }
    }
    return newTask;
  }
}
