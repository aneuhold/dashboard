import TaskMapServiceMock from '$services/Task/TaskMapService/TaskMapService.mock';
import UserSettingsMock from '$stores/userSettings/userSettings.mock';
import TestUsers from './TestUsers';

/**
 * Global mock data for tests.
 */
export default class MockData {
  static taskMapServiceMock = new TaskMapServiceMock(TestUsers.currentUserCto._id);
  static userSettingsMock = new UserSettingsMock(TestUsers.currentUserCto._id);
}
