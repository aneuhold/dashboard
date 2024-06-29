import SBMockData from '$storybook/globalMockData';
import type { Meta, StoryObj } from '@storybook/svelte';
import type SbTaskListExample from './SBTaskListExample.svelte';
import sbTaskListMeta from './TaskList.stories';

const meta = {
  ...sbTaskListMeta,
  title: 'Stateful Components/TaskList/Basic UI'
} satisfies Meta<SbTaskListExample>;
export default meta;

type Story = StoryObj<typeof meta>;

export const SingleTask: Story = {
  beforeEach: () => {
    SBMockData.taskMapServiceMock.addTask({ title: 'Test Task' });
  }
};

export const NoTasks: Story = {
  beforeEach: () => {}
};

export const MultipleTasks: Story = {
  beforeEach: () => {
    SBMockData.taskMapServiceMock.addTasks({ numTasks: 20 });
  }
};
