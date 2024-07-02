import {
  MockTaskDescription,
  MockTaskSharedWith
} from '$services/Task/TaskMapService/TaskMapService.mock';
import type { Meta, StoryObj } from '@storybook/svelte';
import type SbTaskListExample from './SBTaskListExample.svelte';
import sbTaskListMeta from './TaskList.stories';

const meta = {
  ...sbTaskListMeta,
  title: 'Stateful Components/TaskList/Everything'
} satisfies Meta<SbTaskListExample>;
export default meta;

type Story = StoryObj<typeof meta>;

export const AllOptions: Story = {
  args: {
    numTasks: 25,
    includeDueDates: true,
    includeOverDueDates: true,
    includeStartDates: true,
    includeStartDatesInFuture: true,
    sharedWith: MockTaskSharedWith.withMultiplePeople,
    tags: ['tag1', 'tag2', 'tag3', 'Some Really Long Tag Name', 'Tag5', 'Tag6'],
    descriptions: MockTaskDescription.long
  }
};
