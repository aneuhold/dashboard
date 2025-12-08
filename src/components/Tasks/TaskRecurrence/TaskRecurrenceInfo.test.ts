import '@testing-library/jest-dom/vitest';
import {
  type DashboardTask,
  RecurrenceBasis,
  RecurrenceEffect,
  RecurrenceFrequencyType
} from '@aneuhold/core-ts-db-lib';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import type { UUID } from 'crypto';
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
  let taskId: UUID;

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

  it('can check and then uncheck the recurrence checkbox', async () => {
    const user = userEvent.setup();
    render(TaskRecurrenceInfo, { taskId: taskId, childTaskIds: [] });

    const checkbox = screen.getByRole('checkbox');

    // Initially unchecked
    expect(checkbox).not.toBeChecked();
    expect(get(taskStore).recurrenceInfo).toBeUndefined();

    // Click to check
    await user.click(checkbox);

    // Should be checked
    expect(checkbox).toBeChecked();
    expect(get(taskStore).recurrenceInfo).toBeDefined();

    // Click again to uncheck
    await user.click(checkbox);

    // Should be unchecked again
    expect(checkbox).not.toBeChecked();
    expect(get(taskStore).recurrenceInfo).toBeNull();
  });

  it('clicking the checkbox wrapper also properly toggles recurrence', async () => {
    const user = userEvent.setup();
    render(TaskRecurrenceInfo, { taskId: taskId, childTaskIds: [] });

    const checkbox = screen.getByRole('checkbox');
    // The wrapper div is the parent of the checkbox
    const wrapperDiv = checkbox.parentElement?.parentElement;
    if (!wrapperDiv) {
      throw new Error('Could not find wrapper div');
    }

    // Initially unchecked
    expect(checkbox).not.toBeChecked();
    expect(get(taskStore).recurrenceInfo).toBeUndefined();

    // Click the wrapper div to check
    await user.click(wrapperDiv);

    // Should be checked
    expect(checkbox).toBeChecked();
    expect(get(taskStore).recurrenceInfo).toBeDefined();

    // Click the wrapper div again to uncheck
    await user.click(wrapperDiv);

    // Should be unchecked again
    expect(checkbox).not.toBeChecked();
    expect(get(taskStore).recurrenceInfo).toBeNull();
  });
});
