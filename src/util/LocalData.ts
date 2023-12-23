import type { DashboardConfig, Translations } from '@aneuhold/core-ts-api-lib';
import { sleep } from '@aneuhold/core-ts-lib';

export default class LocalData {
  /**
   * A prefix before all stored key names in case cache busting needs to happen
   * at some point.
   */
  private static PREFIX = 'v1-';

  private static storedKeyNames = {
    password: `${this.PREFIX}password`,
    username: `${this.PREFIX}username`,
    apiKey: `${this.PREFIX}apiKey`,
    dashboardConfig: `${this.PREFIX}dashboardConfig`,
    translations: `${this.PREFIX}translations`
  };

  /**
   * An initialization function that should be called before any other
   * functions in this class are called. This is because sometimes the JS
   * loads before the window somehow.
   *
   * Most likely this should only be called in stores it seems.
   */
  static async initialize() {
    while (typeof window === 'undefined') {
      await sleep(5);
    }
  }

  private static storeValue(key: string, value: string) {
    window.localStorage.setItem(key, value);
  }

  private static getValue(key: string) {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    console.error('Window wasnt defined! Cant access localStorage.');
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
    this.storeValue(LocalData.storedKeyNames.dashboardConfig, JSON.stringify(newDashboardConfig));
  }

  static get dashboardConfig(): DashboardConfig | null {
    return this.getStoredObject<DashboardConfig>(LocalData.storedKeyNames.dashboardConfig);
  }

  static set translations(newTranslations: Translations) {
    this.storeValue(LocalData.storedKeyNames.translations, JSON.stringify(newTranslations));
  }

  static get translations(): Translations | null {
    return this.getStoredObject<Translations>(LocalData.storedKeyNames.translations);
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
      typeof currentlyStoredValue === 'string'
    ) {
      const jsonObject = JSON.parse(currentlyStoredValue);
      if (typeof jsonObject === 'object') {
        return jsonObject as ObjectType;
      }
    }
    return null;
  }
}
