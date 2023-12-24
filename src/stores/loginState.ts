import { writable } from 'svelte/store';
import LocalData from 'util/LocalData';
import { localDataReady } from './localDataReady';

export enum LoginState {
  LoggedOut = 'LoggedOut',
  ProcessingCredentials = 'ProcessingCredentials',
  LoggedIn = 'LoggedIn'
}

function createLoginStateStore() {
  const { subscribe, set } = writable<LoginState>(LoginState.LoggedOut);

  // If the local data is ready and the API key is set, then the user is logged
  // in.
  localDataReady.subscribe((ready) => {
    if (ready && LocalData.apiKey && LocalData.apiKey !== '') {
      set(LoginState.LoggedIn);
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
