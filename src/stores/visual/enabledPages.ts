import navInfo, { type PageInfo } from '$util/navInfo';
import { writable } from 'svelte/store';
import { userSettings } from '../userSettings';

function createEnabledPagesStore() {
  const { subscribe, set } = writable<PageInfo[]>(Object.values(navInfo));

  let devModeEnabled: boolean | null = null;
  let previousEnabledFeaturesString = '';

  userSettings.subscribe((settings) => {
    const newEnabledFeaturesString = JSON.stringify(settings.config.enabledFeatures);
    if (
      settings.config.enableDevMode !== devModeEnabled ||
      newEnabledFeaturesString !== previousEnabledFeaturesString
    ) {
      devModeEnabled = settings.config.enableDevMode;
      previousEnabledFeaturesString = newEnabledFeaturesString;
      set(
        Object.values(navInfo).filter((pageInfo) => {
          const pageTitle = pageInfo.title;
          switch (pageTitle) {
            case navInfo.dev.title:
            case navInfo.devArch.title:
              return devModeEnabled;
            case navInfo.finance.title:
              return settings.config.enabledFeatures.financePage;
            case navInfo.automation.title:
              return settings.config.enabledFeatures.automationPage;
            default:
              return true;
          }
        })
      );
    }
  });

  return {
    subscribe
  };
}

export const enabledPages = createEnabledPagesStore();
