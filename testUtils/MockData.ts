import TaskMapServiceMock from '$services/Task/TaskMap/TaskMap.service.mock';
import UserConfigMock from '$stores/local/userConfig/userConfig.mock';
import AdminAPIServiceMock from '$util/api/AdminAPI.service.mock';
import TestUsers from './TestUsers';

/**
 * Global mock data for tests.
 */
export default class MockData {
  static taskMapServiceMock = new TaskMapServiceMock(TestUsers.currentUserCto._id);
  static userSettingsMock = new UserConfigMock(TestUsers.currentUserCto._id);
  static adminAPIServiceMock = new AdminAPIServiceMock();
}
