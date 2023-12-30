import { DashboardUserConfig } from '@aneuhold/core-ts-db-lib';
import { ObjectId } from 'bson';
import { writable } from 'svelte/store';
import LocalData from '../util/LocalData';
import { localDataReady } from './localDataReady';

export type UserSettings = {
  pendingSettingsUpdate: boolean;
  config: DashboardUserConfig;
};

function createUserSettingsStore() {
  const { subscribe, set, update } = writable<UserSettings>({
    pendingSettingsUpdate: false,
    // Just a dummy config to avoid null checks.
    config: new DashboardUserConfig(new ObjectId())
  });

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
