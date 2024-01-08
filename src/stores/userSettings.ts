import { DashboardUserConfig, type UserCTO } from '@aneuhold/core-ts-db-lib';
import { ObjectId } from 'bson';
import { writable } from 'svelte/store';
import LocalData, { localDataReady } from '../util/LocalData';

export type UserSettings = {
  pendingSettingsUpdate: boolean;
  config: DashboardUserConfig;
  collaborators: Record<string, UserCTO>;
};

function createUserSettingsStore() {
  const { subscribe, set, update } = writable<UserSettings>({
    pendingSettingsUpdate: false,
    // Just a dummy config to avoid null checks.
    config: new DashboardUserConfig(new ObjectId()),
    collaborators: {}
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
