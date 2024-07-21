import type { Meta, StoryObj } from '@storybook/svelte';
import type SbTaskDetailsExample from './SBTaskDetailsExample.svelte';
import sbTaskDetailsMeta from './TaskDetails.stories';

const meta = {
  ...sbTaskDetailsMeta,
  title: 'Stateful Components/TaskDetails/Basic UI'
} satisfies Meta<SbTaskDetailsExample>;
export default meta;

type Story = StoryObj<typeof meta>;

export const EmptyTask: Story = {
  args: {}
};

export const NoTaskFound: Story = {
  args: {
    mainTaskExists: false
  }
};
