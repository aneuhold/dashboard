import { userSettings } from '$stores/userSettings/userSettings';
import { createNumberArgTypes } from '$storybook/storybookUtil';
import type { Meta, StoryObj } from '@storybook/svelte';
import SbConfettiExample from './SBConfettiExample.svelte';

const meta = {
  title: 'Singleton Components/Confetti',
  component: SbConfettiExample,
  argTypes: {
    ...createNumberArgTypes('numButtons')
  },
  beforeEach: () => {
    userSettings.update((settings) => {
      settings.config.enabledFeatures.useConfettiForTasks = true;
      return settings;
    });
  }
} satisfies Meta<SbConfettiExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    numButtons: 1
  }
};

export const MultipleConfetti: Story = {
  args: {
    numButtons: 55
  }
};
