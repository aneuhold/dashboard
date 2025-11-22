import '@testing-library/jest-dom/vitest';
import {
  DashboardTask,
  RecurrenceBasis,
  RecurrenceEffect,
  RecurrenceFrequencyType,
  type RecurrenceInfo
} from '@aneuhold/core-ts-db-lib';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { ObjectId } from 'bson';
import { get } from 'svelte/store';
import { type Writable } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { confirmationDialog } from '$components/singletons/dialogs/SingletonConfirmationDialog.svelte';
import { TaskMapService } from '$services/Task/TaskMapService/TaskMapService';
import TaskMapServiceMock from '$services/Task/TaskMapService/TaskMapService.mock';
import TaskRecurrenceService from '$services/Task/TaskRecurrenceService';
import TestUsers from '$testUtils/TestUsers';
import TaskRecurrenceDetails from './TaskRecurrenceDetails.svelte';

// Mock child components to avoid complexity and duplicate text issues
vi.mock('./TaskRecurrenceInfoIcon.svelte', () => ({ default: () => {} }));
vi.mock('./TaskRecurrenceUpdateExample.svelte', () => ({ default: () => {} }));
vi.mock('./TaskRecurrenceWeekdayOfMonth.svelte', () => ({ default: () => {} }));

describe('TaskRecurrenceDetails', () => {
  const userId = TestUsers.currentUserCto._id;
  const mockService = new TaskMapServiceMock(userId);

  const defaultRecurrenceInfo: RecurrenceInfo = {
    frequency: {
      type: RecurrenceFrequencyType.everyXTimeUnit,
      everyXTimeUnit: { x: 1, timeUnit: 'week' }
    },
    recurrenceBasis: RecurrenceBasis.dueDate,
    recurrenceEffect: RecurrenceEffect.rollOnBasis
  };

  let taskStore: Writable<DashboardTask>;
  let taskId: ObjectId;

  beforeEach(() => {
    // Use the mock service to create a task
    const task = mockService.addTask({
      title: 'Test Task',
      startDate: new Date(),
      dueDate: new Date()
    });
    taskId = task._id;

    // Get the real store for the task
    taskStore = TaskMapService.getTaskStore(taskId.toString());

    // Update the task with recurrence info
    taskStore.update((t) => {
      t.recurrenceInfo = { ...defaultRecurrenceInfo };
      return t;
    });
  });

  it("doesn't set recurrenceInfo just by rendering", () => {
    // Create a fresh task that DOES NOT have recurrence info set
    const freshTask = mockService.addTask({
      title: 'Fresh Task',
      startDate: new Date(),
      dueDate: new Date()
    });

    const freshStore = TaskMapService.getTaskStore(freshTask._id.toString());
    // ensure store has no recurrence before render
    expect(get(freshStore).recurrenceInfo).toBeUndefined();

    render(TaskRecurrenceDetails, {
      taskId: freshTask._id.toString(),
      defaultRecurrenceInfo
    });

    // After rendering the details component for a task that had no recurrence
    // info, we should still have no recurrenceInfo set.
    expect(get(freshStore).recurrenceInfo).toBeUndefined();
  });

  it('renders correctly with initial recurrence info', () => {
    render(TaskRecurrenceDetails, { taskId: taskId.toString(), defaultRecurrenceInfo });

    expect(screen.getByText('Frequency')).toBeInTheDocument();
    expect(screen.getByText('Basis')).toBeInTheDocument();
    expect(screen.getByText('Effect')).toBeInTheDocument();
    expect(screen.getByText('Recurring every')).toBeInTheDocument();
  });

  it('disables controls when task has parentRecurringTaskInfo', () => {
    taskStore.update((t) => {
      t.parentRecurringTaskInfo = {
        taskId: new ObjectId(),
        startDate: new Date(),
        dueDate: new Date()
      };
      return t;
    });

    const { container } = render(TaskRecurrenceDetails, {
      taskId: taskId.toString(),
      defaultRecurrenceInfo
    });

    // Check if the main container has the dimmed-color class
    expect(container.firstChild).toHaveClass('dimmed-color');
  });

  it('triggers confirmation dialog when update would cause immediate recurrence', async () => {
    // Mock getSimulatedRecurrenceDate to return a past date
    const spy = vi
      .spyOn(TaskRecurrenceService, 'getSimulatedRecurrenceDate')
      .mockReturnValue(new Date(Date.now() - 10000));

    const { container } = render(TaskRecurrenceDetails, {
      taskId: taskId.toString(),
      defaultRecurrenceInfo
    });

    // We need to trigger a change.
    // The component uses SMUI Select. Changing it in test is tricky.
    // It also uses InputBox for "Recurring every X".
    // Let's try to change the "Recurring every" input.

    const input = container.querySelector('input[type="number"]');
    expect(input).toBeInTheDocument();

    if (input) {
      await fireEvent.input(input, { target: { value: '2' } });
      await fireEvent.blur(input); // InputBox updates on blur usually
    }

    // Wait for any effects
    // The component calls rInfo.set -> setRInfo -> updateWouldTriggerRecurrence

    expect(confirmationDialog.open).toHaveBeenCalled();
    spy.mockRestore();
  });
});
