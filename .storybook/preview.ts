import '../src/globalStyles/global.css';
import type { Preview } from '@storybook/sveltekit';
import { spyOn } from 'storybook/test';
import TestSetup from '$testUtils/TestSetup';

// Hide the warning about SlotDecorator. This happens whenever a decorator
// is used.
//
// This might be a cool thing to fix by contributing to Storybook.
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    args[0]?.includes(`SlotDecorator> was created without expected prop 'svelteVersion'`) ||
    args[0]?.includes(`unknown prop 'svelteVersion'`)
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

const preview: Preview = {
  beforeEach: () => {
    TestSetup.setupGlobalMocks(spyOn);
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
};

export default preview;
