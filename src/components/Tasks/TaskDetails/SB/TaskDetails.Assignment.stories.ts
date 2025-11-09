import type SBTaskDetailsExample from '$components/Tasks/TaskDetails/SB/SBTaskDetailsExample.svelte';
import {
  MockTaskAssignment,
  MockTaskSharedWith
} from '$services/Task/TaskMapService/TaskMapService.mock';
import type { Meta, StoryObj } from '@storybook/svelte';
import sbTaskDetailsMeta from './TaskDetails.stories';

const meta: Meta<SBTaskDetailsExample> = {
  ...sbTaskDetailsMeta,
  title: 'Stateful Components/TaskDetails/Assignment'
};
export default meta;

type Story = StoryObj<typeof meta>;

export const AssignedToMeAndOtherOwner: Story = {
  args: {
    sharedWith: MockTaskSharedWith.withMe,
    assignedTo: MockTaskAssignment.toMe
  }
};

export const AssignedToMeAndAmOwner: Story = {
  args: {
    sharedWith: MockTaskSharedWith.withSinglePerson,
    assignedTo: MockTaskAssignment.toMe
  }
};

export const AssignedToOtherAndOtherOwner: Story = {
  args: {
    sharedWith: MockTaskSharedWith.withMe,
    assignedTo: MockTaskAssignment.toOther
  }
};

export const AssignedToOtherAndAmOwner: Story = {
  args: {
    sharedWith: MockTaskSharedWith.withSinglePerson,
    assignedTo: MockTaskAssignment.toOther
  }
};
