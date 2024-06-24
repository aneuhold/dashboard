import { DashboardUserConfig } from '@aneuhold/core-ts-db-lib';
import { ObjectId } from 'bson';
import type { UserSettings } from './userSettings';

/**
 * Mock user settings for testing.
 */
export const mockUserSettings: UserSettings = {
  config: new DashboardUserConfig(new ObjectId()),
  collaborators: {}
};
