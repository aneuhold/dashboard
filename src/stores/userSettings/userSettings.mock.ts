import { DashboardUserConfig, type UserCTO } from '@aneuhold/core-ts-db-lib';
import type { UUID } from 'crypto';
import { type UserSettings, userSettings } from './userSettings';

/**
 * A mock provider for the UserSettings store. This depends on the backend API
 * being mocked already so it doesn't try to contact the server.
 */
export default class UserSettingsMock {
  constructor(private userId: UUID) {
    this.reset();
  }

  reset(): void {
    const mockSettings: UserSettings = {
      config: new DashboardUserConfig(this.userId),
      collaborators: {}
    };
    userSettings.setWithoutPropogation(mockSettings);
  }

  enableConfetti(): void {
    const currentUserSettings = userSettings.get();
    currentUserSettings.config.enabledFeatures.useConfettiForTasks = true;
    userSettings.setWithoutPropogation(currentUserSettings);
  }

  addCollaborator(collaborator: UserCTO): void {
    const currentUserSettings = userSettings.get();
    currentUserSettings.collaborators[collaborator._id] = collaborator;
    userSettings.setWithoutPropogation(currentUserSettings);
  }
}
