export default class LocalData {
  /**
   * A prefix before all stored key names in case cache busting needs to happen
   * at some point.
   */
  private static PREFIX = 'v1-';

  private static storedKeyNames = {
    password: `${this.PREFIX}password`
  };

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
}
