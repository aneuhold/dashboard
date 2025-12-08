import {
  type DashboardUserConfig,
  DashboardUserConfigSchema,
  DocumentService,
  type UserCTO
} from '@aneuhold/core-ts-db-lib';
import { type Updater, writable } from 'svelte/store';
import DashboardAPIService from '$util/api/DashboardAPIService';
import LocalData, { localDataReady } from '$util/LocalData/LocalData';

export type UserSettings = {
  config: DashboardUserConfig;
  collaborators: Record<string, UserCTO>;
};

function createUserSettingsStore() {
  let currentSettings: UserSettings = {
    // Just a dummy config to avoid null checks.
    config: DashboardUserConfigSchema.parse({ userId: DocumentService.generateID() }),
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

  const updateUserSettingsAndSave = (updater: Updater<UserSettings>) => {
    updateUserSettings(updater);
    DashboardAPIService.updateSettings(currentSettings.config);
  };

  return {
    subscribe,
    set: (newSettings: UserSettings) => {
      updateUserSettingsAndSave(() => newSettings);
    },
    update: (updater: Updater<UserSettings>) => {
      updateUserSettingsAndSave(updater);
    },
    addCollaborator: (user: UserCTO) => {
      updateUserSettingsAndSave((settings) => {
        settings.config.collaborators.push(user._id);
        settings.collaborators[user._id] = user;
        return settings;
      });
    },
    removeCollaborator: (userName: string) => {
      updateUserSettingsAndSave((settings) => {
        const collaboratorId = Object.values(settings.collaborators).find(
          (userCto) => userCto.userName === userName
        )?._id;
        if (!collaboratorId) {
          console.error(`Could not find collaborator with username ${userName}`);
          return settings;
        }
        settings.config.collaborators = settings.config.collaborators.filter(
          (id) => id !== collaboratorId
        );
        delete settings.collaborators[collaboratorId];
        return settings;
      });
    },
    /**
     * Sets the user settings without updating the backend.
     *
     * @param newSettings
     */
    setWithoutPropogation: (newSettings: UserSettings) => {
      updateUserSettings(() => newSettings);
    },
    /**
     * Simply gets the current settings.
     */
    get: () => currentSettings
  };
}

export const userSettings = createUserSettingsStore();
