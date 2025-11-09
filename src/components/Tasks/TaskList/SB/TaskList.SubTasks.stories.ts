import { MockTaskSharedWith } from '$services/Task/TaskMapService/TaskMapService.mock';
import type { Meta, StoryObj } from '@storybook/sveltekit';
import type SbTaskListExample from './SBTaskListExample.svelte';
import sbTaskListMeta from './TaskList.stories';

const meta = {
  ...sbTaskListMeta,
  title: 'Stateful Components/TaskList/Sub Tasks'
} satisfies Meta<SbTaskListExample>;
export default meta;

type Story = StoryObj<typeof meta>;

export enum MockTaskSubTasks {
  none,
  someCompleted,
  someIncomplete,
  someCompleteAndIncomplete,
  someAssignedToMeAndComplete,
  someAssignedToMeAndIncomplete,
  allVariations
}

export const SomeCompleted: Story = {
  args: {
    numTasks: 3,
    subtasks: MockTaskSubTasks.someCompleted
  }
};

export const SomeIncomplete: Story = {
  args: {
    numTasks: 3,
    subtasks: MockTaskSubTasks.someIncomplete
  }
};

export const SomeCompleteAndIncomplete: Story = {
  args: {
    numTasks: 3,
    sharedWith: MockTaskSharedWith.withMe,
    subtasks: MockTaskSubTasks.someCompleteAndIncomplete
  }
};

export const SomeAssignedToMeAndComplete: Story = {
  args: {
    numTasks: 3,
    sharedWith: MockTaskSharedWith.withMe,
    subtasks: MockTaskSubTasks.someAssignedToMeAndComplete
  }
};

export const SomeAssignedToMeAndIncomplete: Story = {
  args: {
    numTasks: 3,
    sharedWith: MockTaskSharedWith.withMe,
    subtasks: MockTaskSubTasks.someAssignedToMeAndIncomplete
  }
};

export const AllVariations: Story = {
  args: {
    numTasks: 3,
    sharedWith: MockTaskSharedWith.withMe,
    subtasks: MockTaskSubTasks.allVariations
  }
};
