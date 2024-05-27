import type { Meta, StoryObj } from '@storybook/svelte';
import Login from './Login.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Logic Components/Login',
  component: Login,
  tags: ['autodocs'],
  argTypes: {}
} satisfies Meta<Login>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {}
};
