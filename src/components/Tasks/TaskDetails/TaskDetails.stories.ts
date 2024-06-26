import { TaskMapService } from '$services/Task/TaskMapService/TaskMapService';
import StorybookMockData from '$storybook/globalMockData';
import { APIService } from '@aneuhold/core-ts-api-lib';
import { DashboardTask, type DocumentMap } from '@aneuhold/core-ts-db-lib';
import type { Meta, StoryObj } from '@storybook/svelte';
import { spyOn } from '@storybook/test';
import TaskDetails from './TaskDetails.svelte';

let mockedTaskMap: DocumentMap<DashboardTask> = {};

const meta = {
  title: 'Stateful Components/TaskDetails',
  component: TaskDetails,
  argTypes: {},
  beforeEach: () => {
    spyOn(APIService, 'callDashboardAPI').mockImplementation((input) => {
      console.log('mocked', input);
      return Promise.resolve({
        success: true,
        errors: [],
        data: {}
      });
    });
  }
} satisfies Meta<TaskDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: () => {
    mockedTaskMap = {
      test: new DashboardTask(StorybookMockData.currentUserCto._id)
    };
    TaskMapService.getStore().set(mockedTaskMap);
    return () => {
      mockedTaskMap = {};
    };
  },
  args: {
    taskId: 'test'
  }
};
