import type { UUID } from 'crypto';
import { writable } from 'svelte/store';
import LocalData from '../util/LocalData';
import { localDataReady } from './localDataReady';

function createApiKeyStore() {
  const { subscribe, set, update } = writable<UUID | null>(null);

  localDataReady.subscribe((ready) => {
    if (ready && LocalData.apiKey !== '') {
      set(LocalData.apiKey as UUID);
    }
  });

  return {
    subscribe,
    set: (apiKey: UUID) => {
      set(apiKey);
      LocalData.apiKey = apiKey;
    },
    update
  };
}

export const apiKey = createApiKeyStore();
