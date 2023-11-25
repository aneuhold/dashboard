import { writable } from 'svelte/store';
import LocalData from '../util/LocalData';

function createPasswordStore() {
  const { subscribe, set, update } = writable<string>(LocalData.password);

  return {
    subscribe,
    set: (newPassword: string) => {
      set(newPassword);
      LocalData.password = newPassword;
    },
    update
  };
}

export const password = createPasswordStore();
