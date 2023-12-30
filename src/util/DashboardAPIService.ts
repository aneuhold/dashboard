import { APIService } from '@aneuhold/core-ts-api-lib';
import type { DashboardUserConfig } from '@aneuhold/core-ts-db-lib';
import type { UUID } from 'crypto';
import { apiKey } from '../stores/apiKey';
import { dashboardConfig } from '../stores/dashboardConfig';
import { LoginState, loginState } from '../stores/loginState';
import { translations } from '../stores/translations';
import { userSettings } from '../stores/userSettings';

export default class DashboardAPIService {
  static dashboardAPIUrlSet = false;

  /**
   * Gets the initial data from the backend and sets the stores accordingly.
   *
   * @returns true if the data was successfully retrieved, false otherwise
   */
  static async getInitialData(): Promise<boolean> {
    const apiKeyValue = this.checkOrSetupDashboardAPI();
    const result = await APIService.callDashboardAPI({
      apiKey: apiKeyValue,
      options: {
        get: {
          translations: true,
          userConfig: true
        }
      }
    });
    if (result.success && result.data?.translations && result.data.userConfig) {
      translations.set(result.data.translations);
      userSettings.set({ pendingSettingsUpdate: false, config: result.data.userConfig });
      loginState.set(LoginState.LoggedIn);
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

  private static checkOrSetupDashboardAPI(): UUID {
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
