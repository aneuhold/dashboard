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
    update,
    addCollaborator: (user: UserCTO) => {
      update((settings) => {
        settings.config.collaborators.push(user._id);
        settings.collaborators[user._id.toString()] = user;
        settings.pendingSettingsUpdate = true;
        return settings;
      });
    },
    removeCollaborator: (userName: string) => {
      update((settings) => {
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
