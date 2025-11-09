import type { Meta, StoryObj } from '@storybook/sveltekit';
import type SbTaskListExample from './SBTaskListExample.svelte';
import sbTaskListMeta from './TaskList.stories';

const meta = {
  ...sbTaskListMeta,
  title: 'Stateful Components/TaskList/Basic UI'
} satisfies Meta<SbTaskListExample>;
export default meta;

type Story = StoryObj<typeof meta>;

export const SingleTask: Story = {
  args: {
    numTasks: 1
  }
};

export const NoTasks: Story = {
  args: {
    numTasks: 0
  }
};

export const MultipleTasks: Story = {};
