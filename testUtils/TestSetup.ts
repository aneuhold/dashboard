import { APIService } from '@aneuhold/core-ts-api-lib';
import type { SpyOnFn } from '$testUtils/types';
import MockData from './MockData';
import TestUsers from './TestUsers';

export default class TestSetup {
  /**
   * Sets up global mocks for tests.
   *
   * @param spyOnFn The spy function to use (e.g. spyOn from storybook/test or vi.spyOn from vitest)
   */
  static setupGlobalMocks(spyOnFn: SpyOnFn) {
    // Mock API
    spyOnFn(APIService, 'callDashboardAPI').mockImplementation((input: unknown) => {
      console.log('mocked', input);
      return Promise.resolve({
        success: true,
        errors: [],
        data: {}
      });
    });

    // Reset stores
    MockData.taskMapServiceMock.reset();
    MockData.userSettingsMock.reset();
    MockData.userSettingsMock.enableConfetti();
    MockData.userSettingsMock.addCollaborator(TestUsers.collaborator1);
    MockData.userSettingsMock.addCollaborator(TestUsers.collaborator2);
  }
}
