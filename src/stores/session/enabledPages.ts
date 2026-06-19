import { writable } from 'svelte/store';
import navInfo, { type PageInfo } from '$util/navInfo';
import { userConfig } from '../local/userConfig/userConfig';

function createEnabledPagesStore() {
  const { subscribe, set } = writable<PageInfo[]>(Object.values(navInfo));

  let devModeEnabled: boolean | null = null;
  let adminPageEnabled: boolean | null = null;
  let previousEnabledFeaturesString = '';

  userConfig.subscribe((settings) => {
    const newEnabledFeaturesString = JSON.stringify(settings.config.enabledFeatures);
    if (
      settings.config.enableDevMode !== devModeEnabled ||
      settings.config.enableAdminPage !== adminPageEnabled ||
      newEnabledFeaturesString !== previousEnabledFeaturesString
    ) {
      devModeEnabled = settings.config.enableDevMode;
      adminPageEnabled = settings.config.enableAdminPage;
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
            case navInfo.homelab.title:
              return settings.config.enabledFeatures.homelabPage;
            case navInfo.entertainment.title:
            case navInfo.nonogramKatana.title:
              return settings.config.enabledFeatures.entertainmentPage;
            case navInfo.admin.title:
            case navInfo.adminUsers.title:
              return adminPageEnabled;
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
