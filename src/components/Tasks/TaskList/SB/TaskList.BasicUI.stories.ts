import sbTaskListMeta from '$components/Tasks/TaskList/SB/TaskList.stories.base';
import SBMockData from '$storybook/globalMockData';
import type { Meta, StoryObj } from '@storybook/svelte';
import type SbTaskListExample from './SBTaskListExample.svelte';

const meta = {
  ...sbTaskListMeta,
  title: 'Stateful Components/TaskList/Basic UI'
} satisfies Meta<SbTaskListExample>;
export default meta;

type Story = StoryObj<typeof meta>;

export const SingleTask: Story = {
  beforeEach: () => {
    SBMockData.taskMapServiceMock.addTask('Test Task');
  }
};

export const NoTasks: Story = {
  beforeEach: () => {}
};

export const MultipleTasks: Story = {
  beforeEach: () => {
    SBMockData.taskMapServiceMock.addTasks(20);
  }
};
