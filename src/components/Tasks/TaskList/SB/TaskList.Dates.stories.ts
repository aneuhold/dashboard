import SBMockData from '$storybook/globalMockData';
import type { Meta, StoryObj } from '@storybook/svelte';
import type SbTaskListExample from './SBTaskListExample.svelte';
import sbTaskListMeta from './TaskList.stories';

const meta = {
  ...sbTaskListMeta,
  title: 'Stateful Components/TaskList/Dates'
} satisfies Meta<SbTaskListExample>;
export default meta;

type Story = StoryObj<typeof meta>;

export const DueDates: Story = {
  beforeEach: () => {
    SBMockData.taskMapServiceMock.addTasks({ numTasks: 20, includeDueDates: true });
  }
};

export const StartDates: Story = {
  beforeEach: () => {
    SBMockData.taskMapServiceMock.addTasks({ numTasks: 20, includeStartDates: true });
  }
};

export const BothDates: Story = {
  beforeEach: () => {
    SBMockData.taskMapServiceMock.addTasks({
      numTasks: 20,
      includeStartDates: true,
      includeDueDates: true
    });
  }
};
