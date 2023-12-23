import type { DashboardConfig } from '@aneuhold/core-ts-api-lib';
import { writable } from 'svelte/store';
import LocalData from '../util/LocalData';

function createDashboardConfigStore() {
  const { subscribe, set, update } = writable<DashboardConfig | null>(LocalData.dashboardConfig);

  if (typeof window === 'undefined') {
    LocalData.initialize().then(() => {
      set(LocalData.dashboardConfig);
    });
  }

  return {
    subscribe,
    set: (newConfig: DashboardConfig) => {
      set(newConfig);
      LocalData.dashboardConfig = newConfig;
    },
    update
  };
}

export const dashboardConfig = createDashboardConfigStore();
