import TaskMapServiceMock from '$services/Task/TaskMapService/TaskMapService.mock';
import UserSettingsMock from '$stores/userSettings/userSettings.mock';
import { type UserCTO } from '@aneuhold/core-ts-db-lib';
import { ObjectId } from 'bson';

/**
 * Global mock data for Storybook.
 */
export default class SBMockData {
  static currentUserCto: UserCTO = {
    _id: new ObjectId(),
    userName: 'storybookUser'
  };
  static collaborator1: UserCTO = {
    _id: new ObjectId(),
    userName: 'Collaborator1'
  };
  static collaborator2: UserCTO = {
    _id: new ObjectId(),
    userName: 'Collaborator2'
  };
  static taskMapServiceMock = new TaskMapServiceMock(SBMockData.currentUserCto._id);
  static userSettingsMock = new UserSettingsMock(SBMockData.currentUserCto._id);
}
