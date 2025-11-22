import { beforeEach, vi } from 'vitest';
import TestSetup from './TestSetup';

// Run global setup before each test
beforeEach(() => {
  TestSetup.setupGlobalMocks(vi.spyOn);
});

// Global Mocks

// TaskMapService
vi.mock('$services/Task/TaskMapService/TaskMapService', () => {
  const mockStore = {
    set: vi.fn(),
    subscribe: vi.fn(),
    addDoc: vi.fn(),
    upsertMany: vi.fn()
  };
  return {
    TaskMapService: {
      getTaskStore: vi.fn(),
      getStore: vi.fn(() => mockStore),
      getMap: vi.fn()
    }
  };
});

// TaskRecurrenceService
vi.mock('$services/Task/TaskRecurrenceService', () => {
  return {
    default: {
      createExampleOfRecurrence: vi.fn().mockReturnValue({
        startDate: new Date(),
        dueDate: new Date()
      }),
      getSimulatedRecurrenceDate: vi.fn().mockReturnValue(new Date(Date.now() + 10000)), // Future date
      executeRecurrenceIfNeeded: vi.fn(),
      executeRecurrenceForTask: vi.fn()
    }
  };
});

// SingletonConfirmationDialog
vi.mock('$components/singletons/dialogs/SingletonConfirmationDialog.svelte', () => {
  return {
    confirmationDialog: {
      open: vi.fn()
    }
  };
});

// TaskTagsService
vi.mock('$services/Task/TaskTagsService', () => ({
  default: {
    addTagForUser: vi.fn()
  }
}));

// TaskListService
vi.mock('$services/Task/TaskListService', () => ({
  default: {
    getTaskIds: vi.fn()
  }
}));

// SMUI Select
vi.mock('@smui/select', () => ({ default: () => {}, Option: () => {} }));
