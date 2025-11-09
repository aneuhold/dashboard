import type { Meta, StoryObj } from '@storybook/sveltekit';
import type SbTaskListExample from './SBTaskListExample.svelte';
import sbTaskListMeta from './TaskList.stories';

const meta = {
  ...sbTaskListMeta,
  title: 'Stateful Components/TaskList/Dates'
} satisfies Meta<SbTaskListExample>;
export default meta;

type Story = StoryObj<typeof meta>;

export const DueDates: Story = {
  args: {
    includeDueDates: true
  }
};

export const StartDates: Story = {
  args: {
    includeStartDates: true
  }
};

export const BothDates: Story = {
  args: {
    includeDueDates: true,
    includeStartDates: true
  }
};
