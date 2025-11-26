import '@testing-library/jest-dom/vitest';
import {
  DashboardTask,
  RecurrenceBasis,
  RecurrenceEffect,
  RecurrenceFrequencyType
} from '@aneuhold/core-ts-db-lib';
import { render, screen } from '@testing-library/svelte';
// ids are strings (UUIDs)
import { get, type Writable } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskMapService } from '$services/Task/TaskMapService/TaskMapService';
import TaskMapServiceMock from '$services/Task/TaskMapService/TaskMapService.mock';
import TestUsers from '$testUtils/TestUsers';
import TaskRecurrenceInfo from './TaskRecurrenceInfo.svelte';

// Mock child components if needed
vi.mock('$components/presentational/SmartDialog.svelte', () => ({ default: () => {} }));

describe('TaskRecurrenceInfo', () => {
  const userId = TestUsers.currentUserCto._id;
  const mockService = new TaskMapServiceMock(userId);

  let taskStore: Writable<DashboardTask>;
  let taskId: string;

  beforeEach(() => {
    // Use the mock service to create a task
    const task = mockService.addTask({
      title: 'Test Task',
      startDate: new Date(),
      dueDate: new Date()
    });
    taskId = task._id;

    // Get the real store for the task
    taskStore = TaskMapService.getTaskStore(taskId);

    vi.clearAllMocks();
  });

  it('shouldnt set recurrenceInfo just by rendering', () => {
    render(TaskRecurrenceInfo, { taskId: taskId, childTaskIds: [] });

    // Just rendering doesn't cause the recurrence info to be set
    const task = get(taskStore);
    expect(task.recurrenceInfo).toBeUndefined();
  });

  it('checkbox is checked when task has recurrence info', () => {
    // Update the task with recurrence info
    taskStore.update((t) => {
      t.recurrenceInfo = {
        frequency: {
          type: RecurrenceFrequencyType.everyXTimeUnit,
          everyXTimeUnit: { x: 1, timeUnit: 'week' }
        },
        recurrenceBasis: RecurrenceBasis.startDate,
        recurrenceEffect: RecurrenceEffect.rollOnBasis
      };
      return t;
    });

    render(TaskRecurrenceInfo, { taskId: taskId, childTaskIds: [] });

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });
});
