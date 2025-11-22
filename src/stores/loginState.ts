import { writable } from 'svelte/store';
import DashboardAPIService from '$util/api/DashboardAPIService';
import LocalData, { localDataReady } from '$util/LocalData/LocalData';

export enum LoginState {
  Initializing = 'Initializing',
  LoggedOut = 'LoggedOut',
  ProcessingCredentials = 'ProcessingCredentials',
  LoggedIn = 'LoggedIn'
}

const Sentry = process.env.VITEST ? null : (await import('@sentry/sveltekit')).default;

/**
 * Sets the Sentry user, but only if not testing.
 *
 * @param username - The username to set in Sentry.
 */
function setSentryUser(username?: string) {
  if (Sentry) {
    Sentry.setUser({ username });
  }
}

function createLoginStateStore() {
  let _loginState = LoginState.Initializing;
  const { subscribe, set } = writable<LoginState>(_loginState);

  function setLoginState(newState: LoginState) {
    _loginState = newState;
    // Add the Sentry info for the user here
    if (newState === LoginState.LoggedIn) {
      setSentryUser(LocalData.username);
    }
    set(_loginState);
  }

  // If the local data is ready and the API key is set, then the user is logged
  // in.
  localDataReady.subscribe((ready) => {
    if (ready) {
      if (LocalData.apiKey && LocalData.apiKey !== '') {
        setLoginState(LoginState.LoggedIn);
        DashboardAPIService.getInitialDataIfNeeded();
      } else {
        setLoginState(LoginState.LoggedOut);
      }
    }
  });

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
