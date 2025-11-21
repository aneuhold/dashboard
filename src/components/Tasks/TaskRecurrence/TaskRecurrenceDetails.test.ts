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
import { type Writable, writable } from 'svelte/store';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { confirmationDialog } from '$components/singletons/dialogs/SingletonConfirmationDialog.svelte';
import { TaskMapService } from '$services/Task/TaskMapService/TaskMapService';
import TaskRecurrenceService from '$services/Task/TaskRecurrenceService';
import TaskRecurrenceDetails from './TaskRecurrenceDetails.svelte';

// Mock dependencies
vi.mock('$services/Task/TaskMapService/TaskMapService', () => {
  return {
    TaskMapService: {
      getTaskStore: vi.fn()
    }
  };
});

vi.mock('$services/Task/TaskRecurrenceService', () => {
  return {
    default: {
      createExampleOfRecurrence: vi.fn().mockReturnValue({
        startDate: new Date(),
        dueDate: new Date()
      }),
      getSimulatedRecurrenceDate: vi.fn().mockReturnValue(new Date(Date.now() + 10000)) // Future date
    }
  };
});

vi.mock('$components/singletons/dialogs/SingletonConfirmationDialog.svelte', () => {
  return {
    confirmationDialog: {
      open: vi.fn()
    }
  };
});

// Mock child components to avoid complexity and duplicate text issues
// In Svelte 5, components are functions.
vi.mock('./TaskRecurrenceInfoIcon.svelte', () => ({ default: () => {} }));
vi.mock('./TaskRecurrenceUpdateExample.svelte', () => ({ default: () => {} }));
vi.mock('./TaskRecurrenceWeekdayOfMonth.svelte', () => ({ default: () => {} }));
vi.mock('@smui/select', () => ({ default: () => {}, Option: () => {} }));

describe('TaskRecurrenceDetails', () => {
  const taskId = new ObjectId();
  const defaultRecurrenceInfo: RecurrenceInfo = {
    frequency: {
      type: RecurrenceFrequencyType.everyXTimeUnit,
      everyXTimeUnit: { x: 1, timeUnit: 'week' }
    },
    recurrenceBasis: RecurrenceBasis.dueDate,
    recurrenceEffect: RecurrenceEffect.rollOnBasis
  };

  let taskStore: Writable<Partial<DashboardTask>>;

  beforeEach(() => {
    taskStore = writable({
      _id: taskId,
      recurrenceInfo: { ...defaultRecurrenceInfo },
      startDate: new Date(),
      dueDate: new Date(),
      parentRecurringTaskInfo: undefined,
      completed: false
    } as unknown as DashboardTask);
    (TaskMapService.getTaskStore as Mock).mockReturnValue(taskStore);
    vi.clearAllMocks();
  });

  it('renders correctly with initial recurrence info', () => {
    render(TaskRecurrenceDetails, { taskId: taskId.toString(), defaultRecurrenceInfo });

    expect(screen.getByText('Frequency')).toBeInTheDocument();
    expect(screen.getByText('Basis')).toBeInTheDocument();
    expect(screen.getByText('Effect')).toBeInTheDocument();
    expect(screen.getByText('Recurring every')).toBeInTheDocument();
  });

  it('disables controls when task has parentRecurringTaskInfo', () => {
    taskStore.set({
      _id: taskId,
      recurrenceInfo: { ...defaultRecurrenceInfo },
      startDate: new Date(),
      dueDate: new Date(),
      parentRecurringTaskInfo: {
        taskId: new ObjectId(),
        startDate: new Date(),
        dueDate: new Date()
      },
      completed: false
    } as unknown as DashboardTask);

    const { container } = render(TaskRecurrenceDetails, {
      taskId: taskId.toString(),
      defaultRecurrenceInfo
    });

    // Check if the main container has the dimmed-color class
    expect(container.firstChild).toHaveClass('dimmed-color');
  });

  it('triggers confirmation dialog when update would cause immediate recurrence', async () => {
    // Mock getSimulatedRecurrenceDate to return a past date
    (TaskRecurrenceService.getSimulatedRecurrenceDate as Mock).mockReturnValue(
      new Date(Date.now() - 10000)
    );

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
  });
});
