import { writable } from 'svelte/store';
import LocalData from '../util/LocalData';

function createApiKeyStore() {
  const { subscribe, set, update } = writable<string>(LocalData.apiKey);

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
