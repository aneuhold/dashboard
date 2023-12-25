import type { DashboardUserConfig } from '@aneuhold/core-ts-db-lib';
import { writable } from 'svelte/store';
import LocalData from '../util/LocalData';
import { localDataReady } from './localDataReady';

export type UserSettings = {
  pendingSettingsUpdate: boolean;
  config?: DashboardUserConfig;
};

function createUserSettingsStore() {
  const { subscribe, set, update } = writable<UserSettings>({ pendingSettingsUpdate: false });

  localDataReady.subscribe((ready) => {
    if (ready && LocalData.userSettings) {
      set(LocalData.userSettings);
    }
  });

  return {
    subscribe,
    set: (newSettings: UserSettings) => {
      set(newSettings);
      LocalData.userSettings = newSettings;
    },
    update
  };
}

export const userSettings = createUserSettingsStore();
