import { writable } from 'svelte/store';
import LocalData, { localDataReady } from 'util/LocalData';
import DashboardAPIService from 'util/api/DashboardAPIService';

export enum LoginState {
  Initializing = 'Initializing',
  LoggedOut = 'LoggedOut',
  ProcessingCredentials = 'ProcessingCredentials',
  LoggedIn = 'LoggedIn'
}

function createLoginStateStore() {
  let _loginState = LoginState.Initializing;
  const { subscribe, set } = writable<LoginState>(_loginState);

  function setLoginState(newState: LoginState) {
    _loginState = newState;
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
