import type { DashboardConfig } from '@aneuhold/core-ts-api-lib';
import { writable } from 'svelte/store';
import LocalData from '../util/LocalData';
import { localDataReady } from './localDataReady';

function createDashboardConfigStore() {
  const { subscribe, set, update } = writable<DashboardConfig | null>(null);

  localDataReady.subscribe((ready) => {
    if (ready) {
      set(LocalData.dashboardConfig);
    }
  });

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
