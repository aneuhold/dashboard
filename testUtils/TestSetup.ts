import { APIService } from '@aneuhold/core-ts-api-lib';
import WebSocketService from '$services/WebSocketService';
import type { SpyOnFn } from '$testUtils/testUtilTypes';
import LocalData from '$util/LocalData/LocalData';
import { createLogger } from '$util/logging/logger';
import MockData from './MockData';
import TestUsers from './TestUsers';

const logger = createLogger('TestSetup');

export default class TestSetup {
  /**
   * Sets up global mocks for tests.
   *
   * @param spyOnFn The spy function to use (e.g. spyOn from storybook/test or vi.spyOn from vitest)
   */
  static setupGlobalMocks(spyOnFn: SpyOnFn) {
    // Mock API
    spyOnFn(APIService, 'callDashboardAPI').mockImplementation((_) => {
      return Promise.resolve({
        success: true,
        errors: [],
        data: {}
      });
    });

    spyOnFn(APIService, 'callAdminAPI').mockImplementation((_) => {
      return Promise.resolve({
        success: true,
        errors: [],
        data: MockData.adminAPIServiceMock.createUsersResponse()
      });
    });

    spyOnFn(WebSocketService, 'connect').mockImplementation(() => {
      logger.debug('Mocked WebSocketService.connect called');
    });

    // Set a mock access token so the app thinks we're logged in
    LocalData.accessToken = 'mock-access-token';

    // Reset stores
    MockData.taskMapServiceMock.reset();
    MockData.adminAPIServiceMock.reset();
    MockData.userSettingsMock.reset();
    MockData.userSettingsMock.enableConfetti();
    MockData.userSettingsMock.addCollaborator(TestUsers.collaborator1);
    MockData.userSettingsMock.addCollaborator(TestUsers.collaborator2);
  }
}
