import { APIService } from '@aneuhold/core-ts-api-lib';
import type { Meta, StoryObj } from '@storybook/svelte';
import { spyOn } from '@storybook/test';
import TaskDetails from './TaskDetails.svelte';

const meta = {
  title: 'Stateful Components/TaskDetails',
  component: TaskDetails,
  argTypes: {},
  beforeEach: () => {
    const dashboardCallSpy = spyOn(APIService, 'callDashboardAPI').mockImplementation((input) => {
      console.log('mocked', input);
      return Promise.resolve({
        success: true,
        errors: [],
        data: {}
      });
    });
    return () => {
      dashboardCallSpy.mockRestore();
    };
  }
} satisfies Meta<TaskDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    taskId: 'test'
  }
};
