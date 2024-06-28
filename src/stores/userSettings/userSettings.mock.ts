import { DashboardUserConfig } from '@aneuhold/core-ts-db-lib';
import { ObjectId } from 'bson';
import { userSettings, type UserSettings } from './userSettings';

export const setupMockUserSettings = (userId: ObjectId) => {
  const mockSettings: UserSettings = {
    config: new DashboardUserConfig(userId),
    collaborators: {}
  };
  mockSettings.config.enabledFeatures.useConfettiForTasks = true;
  userSettings.setWithoutPropogation(mockSettings);
};
