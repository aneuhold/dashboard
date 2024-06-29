import ConfettiSbDecorator from '$components/singletons/Confetti/ConfettiSBDecorator.svelte';
import TaskListService from '$services/Task/TaskListService';
import { TaskMapService } from '$services/Task/TaskMapService/TaskMapService';
import { userSettings } from '$stores/userSettings/userSettings';
import StorybookMockData from '$storybook/globalMockData';
import { createInvisibleArgTypes } from '$storybook/storybookUtil';
import { APIService } from '@aneuhold/core-ts-api-lib';
import { DashboardTask, type DocumentMap } from '@aneuhold/core-ts-db-lib';
import type { Meta, StoryObj } from '@storybook/svelte';
import { spyOn } from '@storybook/test';
import TaskList from './TaskList.svelte';

let mockedTaskMap: DocumentMap<DashboardTask> = {};
let mainTask: DashboardTask = new DashboardTask(StorybookMockData.currentUserCto._id);

const meta = {
  title: 'Stateful Components/TaskList',
  component: TaskList,
  decorators: [() => ({ Component: ConfettiSbDecorator, svelteVersion: 4 })],
  argTypes: {
    ...createInvisibleArgTypes('category', 'sortAndFilterResult', 'parentTaskId')
  },
  beforeEach: () => {
    // Reset the main task
    mainTask = new DashboardTask(StorybookMockData.currentUserCto._id);
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
} satisfies Meta<TaskList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: (context) => {
    mainTask.title = 'Test Task';
    mockedTaskMap = {
      [mainTask._id.toString()]: mainTask
    };
    TaskMapService.getStore().set(mockedTaskMap);
    context.args.sortAndFilterResult = TaskListService.getTaskIds(
      mockedTaskMap,
      userSettings.get(),
      'default'
    );
    return () => {
      mockedTaskMap = {};
    };
  },
  args: {
    category: 'default',
    sortAndFilterResult: {
      filteredAndSortedIds: [],
      removedIds: []
    }
  }
};
