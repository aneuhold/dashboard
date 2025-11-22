import { beforeEach, vi } from 'vitest';
import TestSetup from './TestSetup';

// Run global setup before each test
beforeEach(() => {
  TestSetup.setupGlobalMocks(vi.spyOn);
});

// --- Global Mocks ---

// SingletonConfirmationDialog
vi.mock('$components/singletons/dialogs/SingletonConfirmationDialog.svelte', () => {
  return {
    confirmationDialog: {
      open: vi.fn()
    }
  };
});

// SMUI Select
vi.mock('@smui/select', () => ({ default: () => {}, Option: () => {} }));
