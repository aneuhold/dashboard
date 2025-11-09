import { LoginState, loginState } from '$stores/loginState';
import LocalData from '$util/LocalData/LocalData';
import { APIService } from '@aneuhold/core-ts-api-lib';
import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, spyOn, userEvent, within } from '@storybook/test';
import Login from './Login.svelte';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Stateful Components/Login',
  component: Login,
  argTypes: {},
  beforeEach: () => {
    const spy = spyOn(APIService, 'validateUser').mockResolvedValue({
      success: true,
      errors: [],
      data: {}
    });
    return () => {
      loginState.set(LoginState.LoggedOut);
      spy.mockRestore();
    };
  }
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
  }
};

export const InvalidCredentialsState: Story = {
  beforeEach: () => {
    spyOn(APIService, 'validateUser').mockResolvedValue({
      success: false,
      errors: [],
      data: {}
    });
    spyOn(LocalData, 'username', 'get').mockReturnValue('test');
    spyOn(LocalData, 'password', 'get').mockReturnValue('test');
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loginButton = canvas.getByTestId('login-submit-button');
    await expect(loginButton).toBeInTheDocument();
    await userEvent.click(loginButton);
    const invalidCredentialsMessage = canvas.getByText(/Invalid username or password/i);
    await expect(invalidCredentialsMessage).toBeInTheDocument();
  }
};
