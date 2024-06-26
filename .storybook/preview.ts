import { page } from '$app/stores';
import type { Preview } from '@storybook/svelte';
import { spyOn } from '@storybook/test';
import type { Unsubscriber } from 'svelte/store';

const preview: Preview = {
  beforeEach: () => {
    // Global mocks
    const pageRouteSpy = spyOn(page, 'subscribe').mockResolvedValue(
      null as unknown as Unsubscriber
    );
    return () => {
      pageRouteSpy.mockRestore();
    };
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
