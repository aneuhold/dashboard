import ConfettiSbDecorator from '$components/singletons/Confetti/ConfettiSBDecorator.svelte';
import { TaskMapService } from '$services/Task/TaskMapService/TaskMapService';
import StorybookMockData from '$storybook/globalMockData';
import { createInvisibleArgTypes } from '$storybook/storybookUtil';
import { APIService } from '@aneuhold/core-ts-api-lib';
import { DashboardTask, type DocumentMap } from '@aneuhold/core-ts-db-lib';
import type { Meta, StoryObj } from '@storybook/svelte';
import { spyOn } from '@storybook/test';
import TaskDetails from './TaskDetails.svelte';

let mockedTaskMap: DocumentMap<DashboardTask> = {};
let mainTask: DashboardTask = new DashboardTask(StorybookMockData.currentUserCto._id);

const meta = {
  title: 'Stateful Components/TaskDetails',
  component: TaskDetails,
  decorators: [() => ({ Component: ConfettiSbDecorator, svelteVersion: 4 })],
  argTypes: {
    ...createInvisibleArgTypes('taskId')
  },
  beforeEach: (context) => {
    // Reset the main task
    mainTask = new DashboardTask(StorybookMockData.currentUserCto._id);
    context.args.taskId = mainTask._id.toString();
    // Setup spys
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
    mainTask.title = 'Test Task';
    mockedTaskMap = {
      [mainTask._id.toString()]: mainTask
    };
    console.log(mainTask);
    TaskMapService.getStore().set(mockedTaskMap);
    return () => {
      mockedTaskMap = {};
    };
  },
  args: {
    taskId: 'this doesnt actually get used in the story'
  }
};
