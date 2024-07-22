import {
  MockTaskAssignment,
  MockTaskSharedWith
} from '$services/Task/TaskMapService/TaskMapService.mock';
import type { Meta, StoryObj } from '@storybook/svelte';
import type SbTaskDetailsExample from './SBTaskDetailsExample.svelte';
import sbTaskDetailsMeta from './TaskDetails.stories';

const meta = {
  ...sbTaskDetailsMeta,
  title: 'Stateful Components/TaskDetails/Assignment'
} satisfies Meta<SbTaskDetailsExample>;
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
    assignedTo: MockTaskAssignment.toMe
  }
};
