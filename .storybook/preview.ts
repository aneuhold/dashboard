import { page } from '$app/stores';
import type { Preview } from '@storybook/svelte';
import { spyOn } from '@storybook/test';
import type { Unsubscriber } from 'svelte/store';
import StorybookMockData from './globalMockData';

import { setupMockUserSettings } from '$stores/userSettings/userSettings.mock';
import { APIService } from '@aneuhold/core-ts-api-lib';
import '../src/globalStyles/global.css';

// Hide the warning about SlotDecorator. This happens whenever a decorator
// is used.
//
// This might be a cool thing to fix by contributing to Storybook.
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes(`SlotDecorator> was created without expected prop 'svelteVersion'`)) {
    return;
  }
  originalConsoleWarn(...args);
};

const preview: Preview = {
  beforeEach: () => {
    // Global mocks
    spyOn(page, 'subscribe').mockResolvedValue(null as unknown as Unsubscriber);
    spyOn(APIService, 'callDashboardAPI').mockImplementation((input) => {
      console.log('mocked', input);
      return Promise.resolve({
        success: true,
        errors: [],
        data: {}
      });
    });
    // Global setup for stores
    setupMockUserSettings(StorybookMockData.currentUserCto._id);
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
