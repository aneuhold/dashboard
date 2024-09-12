import {
  MockTaskAssignment,
  MockTaskSharedWith
} from '$services/Task/TaskMapService/TaskMapService.mock';
import type { Meta, StoryObj } from '@storybook/svelte';
import type SbTaskListExample from './SBTaskListExample.svelte';
import sbTaskListMeta from './TaskList.stories';

const meta = {
  ...sbTaskListMeta,
  title: 'Stateful Components/TaskList/Assignment'
} satisfies Meta<SbTaskListExample>;
export default meta;

type Story = StoryObj<typeof meta>;

export const ToMe: Story = {
  args: {
    numTasks: 1,
    sharedWith: MockTaskSharedWith.withMe,
    assignedTo: MockTaskAssignment.toMe
  }
};

export const ToOther: Story = {
  args: {
    numTasks: 1,
    sharedWith: MockTaskSharedWith.withSinglePerson,
    assignedTo: MockTaskAssignment.toOther
  }
};
