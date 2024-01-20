import { writable, type Writable } from 'svelte/store';
import { currentUserId } from '../../stores/derived/currentUserId';
import TaskService from './TaskService';

/**
 * A service responsible for managing tags for tasks.
 */
export default class TaskTagsService {
  private static taskTagsStore: Writable<string[]> | undefined;
  private static userId: string | undefined;
  private static userIdUnsub: undefined | (() => void) = undefined;
  private static taskMapUnsub: undefined | (() => void) = undefined;

  /**
   * Gets the store of all tags used by the current user on tasks.
   */
  static getStore(): Writable<string[]> {
    if (!this.taskTagsStore) {
      this.taskTagsStore = this.createStore();
    }
    return this.taskTagsStore;
  }

  /**
   * Temporary method while refactoring.
   */
  static updateTaskTagsStore() {
    this.getStore().set(this.getAllTaskTags());
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
    const allTaskTagsMap = Object.values(TaskService.getCurrentTaskMap()).reduce(
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
