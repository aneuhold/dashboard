import { APIService } from '@aneuhold/core-ts-api-lib';
import { DocumentService } from '@aneuhold/core-ts-db-lib';
import { apiKey } from '$stores/local/apiKey';
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
    spyOnFn(APIService, 'callDashboardAPI').mockImplementation((_) => {
      return Promise.resolve({
        success: true,
        errors: [],
        data: {}
      });
    });

    // Set some stores
    apiKey.set(DocumentService.generateID());

    // Reset stores
    MockData.taskMapServiceMock.reset();
    MockData.userSettingsMock.reset();
    MockData.userSettingsMock.enableConfetti();
    MockData.userSettingsMock.addCollaborator(TestUsers.collaborator1);
    MockData.userSettingsMock.addCollaborator(TestUsers.collaborator2);
  }
}
