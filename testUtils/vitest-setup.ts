import { cleanup } from '@testing-library/svelte';
import { afterEach, beforeEach, vi } from 'vitest';
import TestSetup from './TestSetup';

// Suppress SMUI Select/Option teardown errors in the test worker. The SMUI Option component
// (Option.svelte -> setSelectedText -> getPrimaryText) tries to call querySelector on a DOM
// element that is already null during Svelte's effect cleanup phase. This started happening
// with Svelte 5.55+ for some reason.
// Using process.on here (rather than vitest's onUnhandledError config) because these rejections
// occur in the test worker, not the main thread.
process.on('unhandledRejection', (reason) => {
  if (
    reason instanceof TypeError &&
    reason.message === "Cannot read properties of null (reading 'querySelector')"
  ) {
    return;
  }
  throw reason;
});

// Run global setup before each test
beforeEach(() => {
  TestSetup.setupGlobalMocks(vi.spyOn);

  // Prevent requestAnimationFrame-driven UI libraries from scheduling callbacks that can fire
  // after component teardown in JSDOM and surface as unhandled errors.
  globalThis.requestAnimationFrame = () => 0;
  globalThis.cancelAnimationFrame = () => undefined;
});

afterEach(() => {
  cleanup();
});

// --- Global Mocks that have to be at Global Scope ---

// SingletonConfirmationDialog
vi.mock('$components/singletons/dialogs/SingletonConfirmationDialog.svelte', () => {
  return {
    confirmationDialog: {
      open: vi.fn()
    }
  };
});
