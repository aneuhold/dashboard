import { derived } from 'svelte/store';
import { userSettings } from '../userSettings';

export const currentUserId = derived(userSettings, ($userSettings) =>
  $userSettings.config._id.toString()
);
