import { writable } from 'svelte/store';
import LocalData from '../util/LocalData';
import { localDataReady } from './localDataReady';

function createApiKeyStore() {
  const { subscribe, set, update } = writable<string>('');

  localDataReady.subscribe((ready) => {
    if (ready) {
      set(LocalData.apiKey);
    }
  });

  return {
    subscribe,
    set: (apiKey: string) => {
      set(apiKey);
      LocalData.apiKey = apiKey;
    },
    update
  };
}

export const apiKey = createApiKeyStore();
