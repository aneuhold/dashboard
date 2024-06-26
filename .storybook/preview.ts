import { page } from '$app/stores';
import { userSettings } from '$stores/userSettings/userSettings';
import { DashboardUserConfig } from '@aneuhold/core-ts-db-lib';
import type { Preview } from '@storybook/svelte';
import { spyOn } from '@storybook/test';
import type { Unsubscriber } from 'svelte/store';
import StorybookMockData from './globalMockData';

import '../src/globalStyles/global.css';

const preview: Preview = {
  beforeEach: () => {
    // Global mocks
    spyOn(page, 'subscribe').mockResolvedValue(null as unknown as Unsubscriber);
    // Global setup for stores
    userSettings.setWithoutPropogation({
      config: new DashboardUserConfig(StorybookMockData.currentUserCto._id),
      collaborators: {}
    });
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
