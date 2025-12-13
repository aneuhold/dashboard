import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import DashboardAPIService from '$util/api/DashboardAPIService';
import { createLazyModuleGetter } from '$util/createLazyModuleGetter';
import LocalData from '$util/LocalData/LocalData';

export enum LoginState {
  Initializing = 'Initializing',
  LoggedOut = 'LoggedOut',
  ProcessingCredentials = 'ProcessingCredentials',
  LoggedIn = 'LoggedIn'
}

// Sentry dynamic import to avoid loading it during tests. This also avoids top-level await
// which is broken in Safari as of 11/2025.
const getSentry = createLazyModuleGetter(
  !process.env.VITEST ? import('@sentry/sveltekit') : undefined
);

function createLoginStateStore() {
  let _loginState = LoginState.Initializing;
  const { subscribe, set } = writable<LoginState>(_loginState);

  function setLoginState(newState: LoginState) {
    _loginState = newState;
    // Add the Sentry info for the user here
    if (newState === LoginState.LoggedIn) {
      getSentry()?.setUser({ username: LocalData.username });
    }
    set(_loginState);
  }

  // Determine initial login state based on persisted API key.
  if (browser && LocalData.apiKey && LocalData.apiKey !== '') {
    setLoginState(LoginState.LoggedIn);
    DashboardAPIService.getInitialDataIfNeeded();
  } else {
    setLoginState(LoginState.LoggedOut);
  }

  return {
    subscribe,
    set: (newState: LoginState) => {
      setLoginState(newState);
    },
    get: () => _loginState
  };
}

/**
 * The state of login for the current user.
 */
export const loginState = createLoginStateStore();
