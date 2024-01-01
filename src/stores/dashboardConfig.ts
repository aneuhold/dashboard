import type { DashboardConfig } from '@aneuhold/core-ts-api-lib';
import { writable } from 'svelte/store';
import LocalData, { localDataReady } from '../util/LocalData';

function createDashboardConfigStore() {
  const { subscribe, set } = writable<DashboardConfig | null>(null);

  let dashboardConfig: DashboardConfig | null = null;

  localDataReady.subscribe((ready) => {
    if (ready) {
      set(LocalData.dashboardConfig);
      dashboardConfig = LocalData.dashboardConfig;
    }
  });

  return {
    subscribe,
    set: (newConfig: DashboardConfig) => {
      set(newConfig);
      LocalData.dashboardConfig = newConfig;
      dashboardConfig = newConfig;
    },
    get: () => {
      return dashboardConfig;
    }
  };
}

export const dashboardConfig = createDashboardConfigStore();
