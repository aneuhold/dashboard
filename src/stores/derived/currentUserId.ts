import { derived } from 'svelte/store';
import { userSettings } from '../userSettings/userSettings';

export const currentUserId = derived(userSettings, ($userSettings) =>
  $userSettings.config.userId.toString()
);
