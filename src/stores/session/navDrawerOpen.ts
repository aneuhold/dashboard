import { writable } from 'svelte/store';

function createNavDrawerOpenStore() {
  const { subscribe, set, update } = writable(false);

  return {
    subscribe,
    set,
    update
  };
}

export const navDrawerOpen = createNavDrawerOpenStore();
