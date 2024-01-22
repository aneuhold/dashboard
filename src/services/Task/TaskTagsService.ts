import type { DashboardTask } from '@aneuhold/core-ts-db-lib';
import type { DashboardTagSettings } from '@aneuhold/core-ts-db-lib/lib/embedded-types/dashboard/userConfig/Tags';
import { writable, type Unsubscriber, type Writable } from 'svelte/store';
import { userSettings } from '../../stores/userSettings';
import type { DocumentMapStoreSubscriber } from '../DocumentMapStoreService';
import { TaskMapService } from './TaskMapService';

/**
 * A service responsible for managing tags for tasks.
 */
export default class TaskTagsService {
  private static taskTagsStore: Writable<string[]> | undefined;
  private static currentTagSettings: DashboardTagSettings = {};
  private static userId: string | undefined;
  private static userSettingsUnsub: undefined | Unsubscriber = undefined;
  /**
   * This should always be a fresh array, so that it doesn't bind to the
   * current user settings.
   */
  private static previousUserTagsArray: string[] = [];

  /**
   * Gets the store of all tags used by the current user on tasks.
   */
  static getStore(): Writable<string[]> {
    if (!this.taskTagsStore) {
      this.taskTagsStore = this.createStore();
    }
    return this.taskTagsStore;
  }

  static getSubscribersForTaskMap(): DocumentMapStoreSubscriber<DashboardTask> {
    return {
      beforeDocUpdate(map, oldDoc, newDoc) {
        if (!TaskTagsService.userId) {
          return newDoc;
        }
        const oldUserTags = oldDoc?.tags[TaskTagsService.userId] ?? [];
        const newUserTags = newDoc.tags[TaskTagsService.userId] ?? [];
        if (oldUserTags.length !== newUserTags.length) {
          const tagsToAdd = TaskTagsService.getNewTags(oldUserTags, newUserTags);
          if (tagsToAdd.length > 0) {
            // Should only ever be on tag added at a time for now.
            TaskTagsService.addTagForUserIfNeeded(tagsToAdd[0]);
          }
        }
        return newDoc;
      }
      // Purposefully not subscribing to the task deletion event, because
      // tags should be removed through the global tag manager. This is a
      // personal preference.
    };
  }

  /**
   * Deletes a tag from the current user's settings and all tasks.
   */
  static deleteTag(tag: string) {
    // Setup user settings subscribers if needed.
    if (!this.taskTagsStore) {
      this.taskTagsStore = this.createStore();
    }
    userSettings.update((settings) => {
      delete settings.config.tagSettings[tag];
      return settings;
    });
    userSettings.saveSettings();
  }

  private static getNewTags(oldTags: string[], newTags: string[]): string[] {
    return newTags.filter((tag) => !oldTags.includes(tag));
  }

  private static getRemovedTags(oldTags: string[], newTags: string[]): string[] {
    return oldTags.filter((tag) => !newTags.includes(tag));
  }

  private static addTagForUserIfNeeded(tag: string) {
    if (!TaskTagsService.userId) {
      return;
    }
    if (!this.currentTagSettings[tag]) {
      this.currentTagSettings[tag] = {
        priority: 0
      };
      // This will trigger the tag store to update as well.
      userSettings.update((settings) => {
        settings.config.tagSettings = this.currentTagSettings;
        return settings;
      });
      userSettings.saveSettings();
    }
  }

  /**
   * Creates the task tag store, which also subscribes to the user settings.
   */
  private static createStore(): Writable<string[]> {
    const taskTagsStore = writable<string[]>([]);

    const updateTaskTags = (newTagSettings: DashboardTagSettings) => {
      const newUserTagsArray = Object.keys(newTagSettings);
      taskTagsStore.set(newUserTagsArray);
      this.previousUserTagsArray = newUserTagsArray;
      this.currentTagSettings = newTagSettings;
    };

    if (!this.userSettingsUnsub) {
      this.userSettingsUnsub = userSettings.subscribe((newSettings) => {
        if (newSettings.config.userId.toString() !== this.userId) {
          this.userId = newSettings.config.userId.toString();
          updateTaskTags(newSettings.config.tagSettings);
          // Return early if the user ID changed.
          return;
        }
        const newTagSettings = newSettings.config.tagSettings;
        const newUserTagsArray = Object.keys(newTagSettings);
        if (newUserTagsArray.length !== this.previousUserTagsArray.length) {
          const removedTags = this.getRemovedTags(this.previousUserTagsArray, newUserTagsArray);
          if (removedTags.length > 0) {
            this.removeTagFromAllTasks(removedTags[0]);
          }
          updateTaskTags(newTagSettings);
        }
      });
    }
    return taskTagsStore;
  }

  /**
   * Removes the provided tag from all tasks for the current user. This should
   * only be triggered from the global tag manager.
   */
  private static removeTagFromAllTasks(tag: string) {
    const userId = this.userId;
    if (!userId) {
      return;
    }
    TaskMapService.getStore().updateMany(
      (task) => {
        const userTags = task.tags[userId];
        if (userTags && userTags.includes(tag)) {
          return true;
        }
        return false;
      },
      (task) => {
        const userTags = task.tags[userId];
        if (userTags) {
          task.tags[userId] = userTags.filter((t) => t !== tag);
        }
        return task;
      }
    );
  }

  /**
   * Updates the provided tag in all tasks for the current user. This should
   * only be triggered from the global tag manager.
   */
  private static updateTagInAllTasks(oldTag: string, newTag: string) {
    const userId = this.userId;
    if (!userId) {
      return;
    }
    TaskMapService.getStore().updateMany(
      (task) => {
        const userTags = task.tags[userId];
        if (userTags && userTags.includes(oldTag)) {
          return true;
        }
        return false;
      },
      (task) => {
        const userTags = task.tags[userId];
        if (userTags) {
          task.tags[userId] = userTags.map((t) => (t === oldTag ? newTag : t));
        }
        return task;
      }
    );
  }
}
