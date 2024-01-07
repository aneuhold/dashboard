import { APIService } from '@aneuhold/core-ts-api-lib';
import type { DashboardUserConfig } from '@aneuhold/core-ts-db-lib';
import type { UUID } from 'crypto';
import LocalData from 'util/LocalData';
import TaskService from 'util/TaskService';
import { apiKey } from '../../stores/apiKey';
import { dashboardConfig } from '../../stores/dashboardConfig';
import { LoginState, loginState } from '../../stores/loginState';
import { translations } from '../../stores/translations';
import { userSettings } from '../../stores/userSettings';
import DashboardTaskAPIService from './DashboardTaskAPIService';

const SECONDS_TO_WAIT_BEFORE_FETCHING_INITIAL_DATA = 10;

export default class DashboardAPIService {
  static lastInitialDataFetchTime: number | null = null;

  private static dashboardAPIUrlSet = false;

  /**
   * Fetches the initial data if
   * - the app is visible and wasn't before
   * - the user is logged in
   * - there is no task queue item
   * - the last initial data fetch was more than {@link SECONDS_TO_WAIT_BEFORE_FETCHING_INITIAL_DATA}
   * ago or it hasn't been fetched yet.
   */
  static async getInitialDataIfNeeded() {
    if (loginState.get() === LoginState.LoggedIn && !DashboardTaskAPIService.hasTaskQueueItem()) {
      if (!this.lastInitialDataFetchTime) {
        await this.getInitialData();
      } else if (
        this.lastInitialDataFetchTime <
        Date.now() - SECONDS_TO_WAIT_BEFORE_FETCHING_INITIAL_DATA * 1000
      ) {
        console.info(
          'Fetching initial data because it has been more than',
          SECONDS_TO_WAIT_BEFORE_FETCHING_INITIAL_DATA,
          'seconds since the last fetch and the user reopened the app.'
        );
        await this.getInitialData();
      }
    }
  }

  /**
   * Gets the initial data from the backend and sets the stores accordingly.
   *
   * @returns true if the data was successfully retrieved, false otherwise
   */
  static async getInitialData(): Promise<boolean> {
    console.log('Getting initial data...');
    this.lastInitialDataFetchTime = Date.now();
    const apiKeyValue = this.checkOrSetupDashboardAPI();
    const result = await APIService.callDashboardAPI({
      apiKey: apiKeyValue,
      options: {
        get: {
          translations: true,
          userConfig: true,
          tasks: true
        }
      }
    });
    if (
      result.success &&
      result.data?.translations &&
      result.data.userConfig &&
      result.data.tasks
    ) {
      translations.set(result.data.translations);
      userSettings.set({ pendingSettingsUpdate: false, config: result.data.userConfig });
      TaskService.getStore().set(DashboardTaskAPIService.convertTaskArrayToMap(result.data.tasks));
      // Clear the task queue since we just got the initial data
      LocalData.taskQueue = [];
      LocalData.currentTaskQueueItem = undefined;
      loginState.set(LoginState.LoggedIn);
      console.log('Initial data retrieved successfully');
      return true;
    } else {
      console.error('Error getting initial backend data, but got past login', result);
      loginState.set(LoginState.LoggedOut);
      return false;
    }
  }

  static async updateSettings(updatedConfig: DashboardUserConfig) {
    const apiKeyValue = this.checkOrSetupDashboardAPI();
    const result = await APIService.callDashboardAPI({
      apiKey: apiKeyValue,
      options: {
        update: {
          userConfig: updatedConfig
        }
      }
    });
    if (result.success && result.data?.userConfig) {
      userSettings.set({ pendingSettingsUpdate: false, config: result.data.userConfig });
    } else {
      console.error('Error updating settings', result);
    }
  }

  static checkOrSetupDashboardAPI(): UUID {
    if (!this.dashboardAPIUrlSet) {
      const url = dashboardConfig.get()?.projectDashboardFunctionUrl;
      if (!url) {
        throw new Error('Dashboard API URL not set!');
      }
      APIService.setDashboardAPIUrl(url);
      this.dashboardAPIUrlSet = true;
    }
    const apiKeyValue = apiKey.get();
    if (!apiKeyValue) {
      throw new Error('API Key not set!');
    }
    return apiKeyValue;
  }
}
