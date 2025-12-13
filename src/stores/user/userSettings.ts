import { DashboardUserConfigSchema, DocumentService, type UserCTO } from '@aneuhold/core-ts-db-lib';
import { type Updater, writable } from 'svelte/store';
import { browser } from '$app/environment';
import DashboardAPIService from '$util/api/DashboardAPIService';
import LocalData from '$util/LocalData/LocalData';

export type UserSettings = {
  config: ReturnType<typeof DashboardUserConfigSchema.parse>;
  collaborators: Record<string, UserCTO>;
};

function createUserSettingsStore() {
  let currentSettings: UserSettings = {
    // Just a dummy config to avoid null checks.
    config: DashboardUserConfigSchema.parse({ userId: DocumentService.generateID() }),
    collaborators: {}
  };
  const { subscribe, set } = writable<UserSettings>(currentSettings);

  const localDataUserSettings = browser ? LocalData.userSettings : null;
  if (localDataUserSettings) {
    currentSettings = localDataUserSettings;
    set(currentSettings);
  }

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
     * @param newSettings New user settings to set locally.
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
