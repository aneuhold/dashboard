import type { DashboardConfig, Translations } from '@aneuhold/core-ts-api-lib';
import { sleep } from '@aneuhold/core-ts-lib';
import { EJSON } from 'bson';
import { writable } from 'svelte/store';
import type { UserSettings } from '../stores/userSettings';
import type { TaskMap } from './Task/TaskService';
import type { TaskInsertOrUpdateInfo } from './api/DashboardTaskAPIService';

function createLocalDataReadyStore() {
  const { subscribe, set } = writable<boolean>(false);

  return {
    subscribe,
    set
  };
}

export const localDataReady = createLocalDataReadyStore();

export default class LocalData {
  /**
   * A prefix before all stored key names in case cache busting needs to happen
   * at some point.
   */
  private static PREFIX = 'v1-';

  private static localStorageAvailable = false;

  private static storedKeyNames = {
    password: `${this.PREFIX}password`,
    username: `${this.PREFIX}username`,
    apiKey: `${this.PREFIX}apiKey`,
    dashboardConfig: `${this.PREFIX}dashboardConfig`,
    translations: `${this.PREFIX}translations`,
    userSettings: `${this.PREFIX}userSettings`,
    taskMap: `${this.PREFIX}taskMap`,
    currentTaskQueueItem: `${this.PREFIX}currentTaskQueueItem`,
    taskQueue: `${this.PREFIX}taskQueue`
  };

  /**
   * An initialization function that should be called before any other
   * functions in this class are called. This is because sometimes the JS
   * loads before the window somehow.
   */
  static async initialize() {
    let attempts = 0;
    while (typeof window === 'undefined' && attempts < 10) {
      await sleep(5);
      attempts += 1;
    }
    if (typeof window !== 'undefined') {
      this.localStorageAvailable = true;
      console.info(`LocalData successfully initialized after ${attempts} attempts.`);
    } else {
      console.info(
        `LocalData could not be initialized after ${attempts} attempts. All usage of LocalData will be ignored. ` +
          `This is probably because the JS is running on the server.`
      );
    }
    localDataReady.set(true);
  }

  private static storeValue(key: string, value: string) {
    if (this.localStorageAvailable) {
      window.localStorage.setItem(key, value);
    }
  }

  private static getValue(key: string) {
    if (this.localStorageAvailable) {
      return window.localStorage.getItem(key);
    }
    return '';
  }

  static set password(newPassword: string) {
    this.storeValue(LocalData.storedKeyNames.password, newPassword);
  }

  static get password(): string {
    const currentlyStoredValue = this.getValue(LocalData.storedKeyNames.password);
    if (currentlyStoredValue && currentlyStoredValue !== '') {
      return currentlyStoredValue;
    }
    return '';
  }

  static set username(newUsername: string) {
    this.storeValue(LocalData.storedKeyNames.username, newUsername);
  }

  static get username(): string {
    const currentlyStoredValue = this.getValue(LocalData.storedKeyNames.username);
    if (currentlyStoredValue && currentlyStoredValue !== '') {
      return currentlyStoredValue;
    }
    return '';
  }

  static set apiKey(newApiKey: string) {
    this.storeValue(LocalData.storedKeyNames.apiKey, newApiKey);
  }

  static get apiKey(): string {
    const currentlyStoredValue = this.getValue(LocalData.storedKeyNames.apiKey);
    if (currentlyStoredValue && currentlyStoredValue !== '') {
      return currentlyStoredValue;
    }
    return '';
  }

  static set dashboardConfig(newDashboardConfig: DashboardConfig) {
    this.storeValue(
      LocalData.storedKeyNames.dashboardConfig,
      EJSON.stringify(newDashboardConfig, { relaxed: false })
    );
  }

  static get dashboardConfig(): DashboardConfig | null {
    return this.getStoredObject<DashboardConfig>(LocalData.storedKeyNames.dashboardConfig);
  }

  static set translations(newTranslations: Translations) {
    this.storeValue(
      LocalData.storedKeyNames.translations,
      EJSON.stringify(newTranslations, { relaxed: false })
    );
  }

  static get translations(): Translations | null {
    return this.getStoredObject<Translations>(LocalData.storedKeyNames.translations);
  }

  static set userSettings(newSettings: UserSettings) {
    this.storeValue(
      LocalData.storedKeyNames.userSettings,
      EJSON.stringify(newSettings, { relaxed: false })
    );
  }

  static get userSettings(): UserSettings | null {
    return this.getStoredObject<UserSettings>(LocalData.storedKeyNames.userSettings);
  }

  static set taskMap(newTaskMap: TaskMap) {
    this.storeValue(
      LocalData.storedKeyNames.taskMap,
      EJSON.stringify(newTaskMap, { relaxed: false })
    );
  }

  static get taskMap(): TaskMap | null {
    return this.getStoredObject<TaskMap>(LocalData.storedKeyNames.taskMap);
  }

  static set currentTaskQueueItem(newTaskQueueItem: TaskInsertOrUpdateInfo | undefined) {
    this.storeValue(
      LocalData.storedKeyNames.currentTaskQueueItem,
      EJSON.stringify(newTaskQueueItem)
    );
  }

  static get currentTaskQueueItem(): TaskInsertOrUpdateInfo | undefined {
    const result = this.getStoredObject<TaskInsertOrUpdateInfo>(
      LocalData.storedKeyNames.currentTaskQueueItem
    );
    if (!result) {
      return undefined;
    }
    return result;
  }

  static set taskQueue(newTaskQueue: TaskInsertOrUpdateInfo[]) {
    this.storeValue(LocalData.storedKeyNames.taskQueue, EJSON.stringify(newTaskQueue));
  }

  static get taskQueue(): TaskInsertOrUpdateInfo[] {
    const result = this.getStoredObject<TaskInsertOrUpdateInfo[]>(
      LocalData.storedKeyNames.taskQueue
    );
    if (!result) {
      return [];
    }
    return result;
  }

  /**
   * Gets a stored object with some basic validation. This should be setup
   * to use type guards.
   */
  private static getStoredObject<ObjectType>(key: string): ObjectType | null {
    const currentlyStoredValue = this.getValue(key);
    if (
      currentlyStoredValue &&
      currentlyStoredValue !== '' &&
      currentlyStoredValue !== 'undefined' &&
      typeof currentlyStoredValue === 'string'
    ) {
      const jsonObject = EJSON.parse(currentlyStoredValue);
      if (typeof jsonObject === 'object') {
        return jsonObject as ObjectType;
      }
    }
    return null;
  }
}
