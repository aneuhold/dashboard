import LocalData, { localDataReady } from '$util/LocalData/LocalData';
import type { UUID } from 'crypto';
import { writable } from 'svelte/store';

function createApiKeyStore() {
  const { subscribe, set } = writable<UUID | null>(null);

  let apiKey: UUID | null = null;

  localDataReady.subscribe((ready) => {
    if (ready && LocalData.apiKey !== '') {
      set(LocalData.apiKey as UUID);
      apiKey = LocalData.apiKey as UUID;
    }
  });

  return {
    subscribe,
    set: (newApiKey: UUID | null) => {
      set(newApiKey);
      if (newApiKey === null) {
        LocalData.apiKey = '';
      } else {
        LocalData.apiKey = newApiKey;
      }
      apiKey = newApiKey;
    },
    get: () => apiKey
  };
}

export const apiKey = createApiKeyStore();
