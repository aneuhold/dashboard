import { writable } from 'svelte/store';
import LocalData, { localDataReady } from 'util/LocalData';

export enum LoginState {
  Initializing = 'Initializing',
  LoggedOut = 'LoggedOut',
  ProcessingCredentials = 'ProcessingCredentials',
  LoggedIn = 'LoggedIn'
}

function createLoginStateStore() {
  const { subscribe, set } = writable<LoginState>(LoginState.Initializing, () => {
    console.log('Login state initialized');
  });

  // If the local data is ready and the API key is set, then the user is logged
  // in.
  localDataReady.subscribe((ready) => {
    if (ready) {
      if (LocalData.apiKey && LocalData.apiKey !== '') {
        set(LoginState.LoggedIn);
      } else {
        set(LoginState.LoggedOut);
      }
    }
  });

  return {
    subscribe,
    set
  };
}

/**
 * The state of login for the current user.
 */
export const loginState = createLoginStateStore();
