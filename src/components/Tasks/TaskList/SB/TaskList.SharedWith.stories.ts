import { MockTaskSharedWith } from '$services/Task/TaskMapService/TaskMapService.mock';
import type { Meta, StoryObj } from '@storybook/svelte';
import type SbTaskListExample from './SBTaskListExample.svelte';
import sbTaskListMeta from './TaskList.stories';

const meta = {
  ...sbTaskListMeta,
  title: 'Stateful Components/TaskList/Shared With'
} satisfies Meta<SbTaskListExample>;
export default meta;

type Story = StoryObj<typeof meta>;

export const WithMe: Story = {
  args: {
    numTasks: 1,
    sharedWith: MockTaskSharedWith.withMe
  }
};

export const With1Person: Story = {
  args: {
    numTasks: 1,
    sharedWith: MockTaskSharedWith.withSinglePerson
  }
};

export const With2People: Story = {
  args: {
    numTasks: 1,
    sharedWith: MockTaskSharedWith.withMultiplePeople
  }
};
