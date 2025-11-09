import type { Preview } from '@storybook/svelte';
import { spyOn } from '@storybook/test';
import SBMockData from './globalMockData';

import { APIService } from '@aneuhold/core-ts-api-lib';
import '../src/globalStyles/global.css';

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
    // Global mocks
    spyOn(APIService, 'callDashboardAPI').mockImplementation((input) => {
      console.log('mocked', input);
      return Promise.resolve({
        success: true,
        errors: [],
        data: {}
      });
    });
    // Global setup for stores
    SBMockData.taskMapServiceMock.reset();
    SBMockData.userSettingsMock.reset();
    SBMockData.userSettingsMock.enableConfetti();
    SBMockData.userSettingsMock.addCollaborator(SBMockData.collaborator1);
    SBMockData.userSettingsMock.addCollaborator(SBMockData.collaborator2);
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
