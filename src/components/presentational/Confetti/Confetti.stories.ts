import { userSettings } from '$stores/userSettings/userSettings';
import { mockUserSettings } from '$stores/userSettings/userSettings.mock';
import { createNumberArgTypes } from '$storybook/storybookUtil';
import type { Meta, StoryObj } from '@storybook/svelte';
import ConfettiExample from './ConfettiExample.svelte';

const meta = {
  title: 'Presentational Components/Confetti',
  component: ConfettiExample,
  argTypes: {
    ...createNumberArgTypes('numButtons')
  },
  beforeEach: () => {
    mockUserSettings.config.enabledFeatures.useConfettiForTasks = true;
    userSettings.setWithoutPropogation(mockUserSettings);
    return () => {
      mockUserSettings.config.enabledFeatures.useConfettiForTasks = false;
      userSettings.setWithoutPropogation(mockUserSettings);
    };
  }
} satisfies Meta<ConfettiExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    numButtons: 1
  }
};

export const MultipleConfetti: Story = {
  args: {
    numButtons: 3
  }
};
