import type { Meta, StoryObj } from '@storybook/sveltekit';
import type SbTaskListExample from './SBTaskListExample.svelte';
import sbTaskListMeta from './TaskList.stories';

const meta = {
  ...sbTaskListMeta,
  title: 'Stateful Components/TaskList/Tags'
} satisfies Meta<SbTaskListExample>;
export default meta;

type Story = StoryObj<typeof meta>;

export const SingleTag: Story = {
  args: {
    numTasks: 1,
    tags: ['tag1']
  }
};

export const ThreeTags: Story = {
  args: {
    numTasks: 1,
    tags: ['tag1', 'tag2', 'tag3']
  }
};

export const ManyTags: Story = {
  args: {
    numTasks: 1,
    tags: ['tag1', 'tag2', 'tag3', 'Some Really Long Tag Name', 'Tag5', 'Tag6']
  }
};
