import { MockTaskDescription } from '$services/Task/TaskMapService/TaskMapService.mock';
import type { Meta, StoryObj } from '@storybook/svelte';
import type SbTaskListExample from './SBTaskListExample.svelte';
import sbTaskListMeta from './TaskList.stories';

const meta = {
  ...sbTaskListMeta,
  title: 'Stateful Components/TaskList/Descriptions'
} satisfies Meta<SbTaskListExample>;
export default meta;

type Story = StoryObj<typeof meta>;

export const ShortDescription: Story = {
  args: {
    numTasks: 20,
    descriptions: MockTaskDescription.short
  }
};

export const LongDescription: Story = {
  args: {
    numTasks: 20,
    descriptions: MockTaskDescription.long
  }
};
