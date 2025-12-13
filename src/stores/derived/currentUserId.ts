import { derived } from 'svelte/store';
import { userSettings } from '../user/userSettings';

export const currentUserId = derived(userSettings, ($userSettings) => $userSettings.config.userId);
