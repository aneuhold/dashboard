import type { Translations } from '@aneuhold/core-ts-api-lib';
import { writable } from 'svelte/store';
import LocalData from '../util/LocalData';

function createTranslationsStore() {
  const { subscribe, set, update } = writable<Translations | null>(LocalData.translations);

  if (typeof window === 'undefined') {
    LocalData.initialize().then(() => {
      set(LocalData.translations);
    });
  }

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
