import { MockTaskSharedWith } from '$services/Task/TaskMapService/TaskMapService.mock';
import type { Meta, StoryObj } from '@storybook/sveltekit';
import type SbTaskDetailsExample from './SBTaskDetailsExample.svelte';
import sbTaskDetailsMeta from './TaskDetails.stories';

const meta = {
  ...sbTaskDetailsMeta,
  title: 'Stateful Components/TaskDetails/Sharing'
} satisfies Meta<SbTaskDetailsExample>;
export default meta;

type Story = StoryObj<typeof meta>;

export const SharedWithMe: Story = {
  args: {
    sharedWith: MockTaskSharedWith.withMe
  }
};

export const SharedWith1Person: Story = {
  args: {
    sharedWith: MockTaskSharedWith.withSinglePerson
  }
};

export const SharedWith2People: Story = {
  args: {
    sharedWith: MockTaskSharedWith.withMultiplePeople
  }
};
