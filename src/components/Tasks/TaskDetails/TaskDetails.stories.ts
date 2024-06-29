import ConfettiSbDecorator from '$components/singletons/Confetti/SBConfettiDecorator.svelte';
import SBMockData from '$storybook/globalMockData';
import { createInvisibleArgTypes } from '$storybook/storybookUtil';
import type { Meta, StoryObj } from '@storybook/svelte';
import TaskDetails from './TaskDetails.svelte';

const meta = {
  title: 'Stateful Components/TaskDetails',
  component: TaskDetails,
  decorators: [() => ({ Component: ConfettiSbDecorator, svelteVersion: 4 })],
  argTypes: {
    ...createInvisibleArgTypes('taskId')
  },
  beforeEach: () => {
    // Reset the main task
    SBMockData.taskMapServiceMock.reset();
  }
} satisfies Meta<TaskDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultStory: Story = {
  args: {
    taskId: 'this doesnt actually get used in the story'
  }
};

export const Default: Story = {
  beforeEach: (context) => {
    const mainTask = SBMockData.taskMapServiceMock.addTask({ title: 'Test Task' });
    context.args.taskId = mainTask._id.toString();
  },
  args: defaultStory.args
};

export const TaskNotFound: Story = {
  beforeEach: () => {},
  args: defaultStory.args
};
