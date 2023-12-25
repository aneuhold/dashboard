import type { Translations } from '@aneuhold/core-ts-api-lib';
import { writable } from 'svelte/store';
import LocalData from '../util/LocalData';
import { localDataReady } from './localDataReady';

function createTranslationsStore() {
  const { subscribe, set, update } = writable<Translations>({});

  localDataReady.subscribe((ready) => {
    if (ready && LocalData.translations) {
      set(LocalData.translations);
    }
  });

  return {
    subscribe,
    set: (newTranslations: Translations) => {
      set(newTranslations);
      LocalData.translations = newTranslations;
    },
    update
  };
}

export const translations = createTranslationsStore();
