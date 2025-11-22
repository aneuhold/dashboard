import { cleanup } from '@testing-library/svelte';
import { afterEach, beforeEach, vi } from 'vitest';
import TestSetup from './TestSetup';

// Run global setup before each test
beforeEach(() => {
  TestSetup.setupGlobalMocks(vi.spyOn);
});

afterEach(() => {
  cleanup();
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
