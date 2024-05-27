import { LoginState, loginState } from '$stores/loginState';
import LocalData from '$util/LocalData/LocalData';
import type { Meta, StoryObj } from '@storybook/svelte';
import { spyOn } from '@storybook/test';
import Login from './Login.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Stateful Components/Login',
  component: Login,
  argTypes: {}
} satisfies Meta<Login>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const EmptyState: Story = {};

export const FilledIn: Story = {
  beforeEach: () => {
    spyOn(LocalData, 'username', 'get').mockReturnValue('test');
    spyOn(LocalData, 'password', 'get').mockReturnValue('test');
  }
};

export const ProcessingState: Story = {
  beforeEach: () => {
    loginState.set(LoginState.ProcessingCredentials);
    return () => {
      loginState.set(LoginState.LoggedOut);
    };
  }
};
