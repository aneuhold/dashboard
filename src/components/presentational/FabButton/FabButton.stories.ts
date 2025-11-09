import { createInvisibleArgTypes, createTextArgTypes } from '$storybook/storybookUtil';
import type { Meta, StoryObj } from '@storybook/sveltekit';
import { fn } from 'storybook/test';
import FabButton from './FabButton.svelte';

const meta: Meta<FabButton> = {
  title: 'Presentational Components/FabButton',
  component: FabButton,
  args: {
    clickHandler: fn()
  },
  argTypes: {
    ...createInvisibleArgTypes('clickHandler'),
    ...createTextArgTypes('label', 'iconName')
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithoutLabel: Story = {
  args: {
    iconName: 'add'
  }
};

export const WithLabel: Story = {
  args: {
    iconName: 'add',
    label: 'Add'
  }
};
