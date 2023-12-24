import { writable } from 'svelte/store';

function createLocalDataReadyStore() {
  const { subscribe, set } = writable<boolean>(false);

  return {
    subscribe,
    set
  };
}

export const localDataReady = createLocalDataReadyStore();
