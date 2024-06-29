import TaskMapServiceMock from '$services/Task/TaskMapService/TaskMapService.mock';
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
  static taskMapServiceMock = new TaskMapServiceMock(SBMockData.currentUserCto._id);
}
