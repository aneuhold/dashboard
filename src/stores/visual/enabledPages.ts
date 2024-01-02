import { writable } from 'svelte/store';
import navInfo, { type PageInfo } from 'util/navInfo';
import { userSettings } from '../userSettings';

function createEnabledPagesStore() {
  const { subscribe, set } = writable<PageInfo[]>(Object.values(navInfo));

  let devModeEnabled = true;

  userSettings.subscribe((settings) => {
    if (settings.config.enableDevMode !== devModeEnabled) {
      devModeEnabled = settings.config.enableDevMode;
      if (!devModeEnabled) {
        set(
          Object.values(navInfo).filter(
            (pageInfo) =>
              pageInfo.title !== navInfo.dev.title && pageInfo.title !== navInfo.devArch.title
          )
        );
      } else {
        set(Object.values(navInfo));
      }
    }
  });

  return {
    subscribe
  };
}

export const enabledPages = createEnabledPagesStore();
