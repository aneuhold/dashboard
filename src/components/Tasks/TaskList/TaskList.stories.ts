import SbConfettiDecorator from '$components/singletons/Confetti/SBConfettiDecorator.svelte';
import TaskMapServiceMock from '$services/Task/TaskMapService/TaskMapService.mock';
import StorybookMockData from '$storybook/globalMockData';
import { createInvisibleArgTypes } from '$storybook/storybookUtil';
import type { Meta, StoryObj } from '@storybook/svelte';
import SbTaskListExample from './SBTaskListExample.svelte';

const taskMapMock = new TaskMapServiceMock(StorybookMockData.currentUserCto._id);

const meta = {
  title: 'Stateful Components/TaskList',
  component: SbTaskListExample,
  decorators: [() => ({ Component: SbConfettiDecorator, svelteVersion: 4 })],
  argTypes: {
    ...createInvisibleArgTypes('category', 'sortAndFilterResult', 'parentTaskId')
  },
  beforeEach: () => {
    // Reset the mock
    taskMapMock.reset();
  }
} satisfies Meta<SbTaskListExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleTask: Story = {
  beforeEach: () => {
    taskMapMock.addTask('Test Task');
  }
};

export const NoTasks: Story = {
  beforeEach: () => {}
};

export const MultipleTasks: Story = {
  beforeEach: () => {
    taskMapMock.addTasks(20);
  }
};
