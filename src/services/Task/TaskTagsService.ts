import type { DashboardTask } from '@aneuhold/core-ts-db-lib';
import { writable, type Unsubscriber, type Writable } from 'svelte/store';
import { currentUserId } from '../../stores/derived/currentUserId';
import type { DocumentMapStoreSubscriber } from '../DocumentMapStoreService';
import { TaskMapService } from './TaskMapService';

/**
 * A service responsible for managing tags for tasks.
 *
 * Maybe a store that triggers when any task updates?
 *
 * OR a service that
 */
export default class TaskTagsService {
  private static taskTagsStore: Writable<string[]> | undefined;
  private static userId: string | undefined;
  private static userIdUnsub: undefined | Unsubscriber = undefined;
  private static taskMapUnsub: undefined | Unsubscriber = undefined;

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
        if (oldDoc?.tags.length !== newDoc.tags.length) {
          TaskTagsService.updateTaskTagsStore();
        }
        return newDoc;
      }
    };
  }

  private static createStore(): Writable<string[]> {
    const taskTagsStore = writable<string[]>([]);
    if (!this.userIdUnsub) {
      this.userIdUnsub = currentUserId.subscribe((userId) => {
        if (userId !== this.userId) {
          this.userId = userId;
          taskTagsStore.set(this.getAllTaskTags());
        }
      });
    }
    return taskTagsStore;
  }

  private static updateTaskTagsStore() {
    this.getStore().set(this.getAllTaskTags());
  }

  /**
   * Gets all task tags for the current user.
   * @returns
   */
  private static getAllTaskTags(): string[] {
    if (!this.userId) {
      return [];
    }
    const userId = this.userId;
    // Convert to a map first to remove duplicates.
    const allTaskTagsMap = Object.values(TaskMapService.getMap()).reduce(
      (tags, task) => {
        const taskTags = task.tags[userId];
        if (taskTags) {
          taskTags.forEach((tag) => {
            tags[tag] = true;
          });
        }
        return tags;
      },
      {} as Record<string, boolean>
    );
    return Object.keys(allTaskTagsMap);
  }
}
