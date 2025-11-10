import { writable } from 'svelte/store';
import LocalData, { localDataReady } from '$util/LocalData/LocalData';

function createPasswordStore() {
  const { subscribe, set, update } = writable<string>('');

  localDataReady.subscribe((ready) => {
    if (ready) {
      set(LocalData.password);
    }
  });

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
