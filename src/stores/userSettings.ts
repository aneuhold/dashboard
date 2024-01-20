import { DashboardUserConfig, type UserCTO } from '@aneuhold/core-ts-db-lib';
import { ObjectId } from 'bson';
import { writable, type Updater } from 'svelte/store';
import LocalData, { localDataReady } from '../util/LocalData';

export type UserSettings = {
  pendingSettingsUpdate: boolean;
  config: DashboardUserConfig;
  collaborators: Record<string, UserCTO>;
};

function createUserSettingsStore() {
  let currentSettings: UserSettings = {
    pendingSettingsUpdate: false,
    // Just a dummy config to avoid null checks.
    config: new DashboardUserConfig(new ObjectId()),
    collaborators: {}
  };
  const { subscribe, set } = writable<UserSettings>(currentSettings);

  localDataReady.subscribe((ready) => {
    const localDataUserSettings = LocalData.userSettings;
    if (ready && localDataUserSettings) {
      updateUserSettings(() => localDataUserSettings);
    }
  });

  const updateUserSettings = (updater: Updater<UserSettings>) => {
    currentSettings = updater(currentSettings);
    set(currentSettings);
    LocalData.userSettings = currentSettings;
  };

  return {
    subscribe,
    set: (newSettings: UserSettings) => {
      updateUserSettings(() => newSettings);
    },
    update: (updater: Updater<UserSettings>) => {
      updateUserSettings(updater);
    },
    addCollaborator: (user: UserCTO) => {
      updateUserSettings((settings) => {
        settings.config.collaborators.push(user._id);
        settings.collaborators[user._id.toString()] = user;
        settings.pendingSettingsUpdate = true;
        return settings;
      });
    },
    removeCollaborator: (userName: string) => {
      updateUserSettings((settings) => {
        const collaboratorId = Object.values(settings.collaborators).find(
          (userCto) => userCto.userName === userName
        )?._id;
        if (!collaboratorId) {
          console.error(`Could not find collaborator with username ${userName}`);
          return settings;
        }
        settings.config.collaborators = settings.config.collaborators.filter(
          (id) => id.toString() !== collaboratorId.toString()
        );
        delete settings.collaborators[collaboratorId.toString()];
        settings.pendingSettingsUpdate = true;
        return settings;
      });
    }
  };
}

export const userSettings = createUserSettingsStore();
