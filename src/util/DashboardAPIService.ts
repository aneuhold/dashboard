import { APIService } from '@aneuhold/core-ts-api-lib';
import type { DashboardTask, DashboardUserConfig } from '@aneuhold/core-ts-db-lib';
import type { UUID } from 'crypto';
import { apiKey } from '../stores/apiKey';
import { dashboardConfig } from '../stores/dashboardConfig';
import { LoginState, loginState } from '../stores/loginState';
import { taskMap, type TaskMap } from '../stores/taskMap';
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
      taskMap.set(this.convertTaskResultToMap(result.data.tasks));
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

  static async updateTasks(newTaskMap: TaskMap) {
    const apiKeyValue = this.checkOrSetupDashboardAPI();
    const result = await APIService.callDashboardAPI({
      apiKey: apiKeyValue,
      options: {
        get: {
          tasks: true
        },
        update: {
          tasks: Object.values(newTaskMap)
        }
      }
    });
    if (result.success && result.data?.tasks) {
      taskMap.set(this.convertTaskResultToMap(result.data.tasks));
    } else {
      console.error('Error updating tasks', result);
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

  private static convertTaskResultToMap(tasks: DashboardTask[]): TaskMap {
    return tasks.reduce((map, task) => {
      map[task._id.toString()] = task;
      return map;
    }, {} as TaskMap);
  }
}
