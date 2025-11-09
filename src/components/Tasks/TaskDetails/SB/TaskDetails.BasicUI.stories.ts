import type SBTaskDetailsExample from '$components/Tasks/TaskDetails/SB/SBTaskDetailsExample.svelte';
import type { Meta, StoryObj } from '@storybook/sveltekit';
import sbTaskDetailsMeta from './TaskDetails.stories';

const meta: Meta<SBTaskDetailsExample> = {
  ...sbTaskDetailsMeta,
  title: 'Stateful Components/TaskDetails/Basic UI'
};
export default meta;

type Story = StoryObj<typeof meta>;

export const EmptyTask: Story = {
  args: {}
};

export const NoTaskFound: Story = {
  args: {
    mainTaskExists: false
  }
};
