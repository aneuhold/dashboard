import type { UUID } from 'crypto';
import { writable } from 'svelte/store';
import LocalData from '../util/LocalData';
import { localDataReady } from './localDataReady';

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
    set: (newApiKey: UUID) => {
      set(newApiKey);
      LocalData.apiKey = apiKey as string;
      apiKey = newApiKey;
    },
    get: () => apiKey
  };
}

export const apiKey = createApiKeyStore();
