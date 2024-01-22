import type { DashboardTask } from '@aneuhold/core-ts-db-lib';
import type { BreadCrumbArray } from 'components/BreadCrumb.svelte';
import { TaskMapService } from './TaskMapService';

/**
 * The main task utility service.
 */
export default class TaskService {
  static getTaskRoute(taskId: string, includeFirstSlash = true) {
    return `${includeFirstSlash ? '/' : ''}tasks?taskId=${taskId}`;
  }

  /**
   * Gets the appropriate route for the task category page for the given task.
   */
  static getTaskCategoryBreadCrumbs(taskId: string): BreadCrumbArray {
    const defaultBreadCrumbs = [{ name: 'tasks', link: 'tasks' }];
    const task = TaskMapService.getMap()[taskId];
    if (!task) {
      return defaultBreadCrumbs;
    }
    switch (task.category) {
      case 'default':
        return defaultBreadCrumbs;
      default:
        return defaultBreadCrumbs;
    }
  }

  static getBreadCrumbArray(taskId: string): BreadCrumbArray {
    const task = TaskMapService.getMap()[taskId];
    const breadCrumbs: BreadCrumbArray = [];
    if (!task)
      return [
        { name: 'tasks', link: 'tasks' },
        { name: 'Task not found', link: `link not needed` }
      ];
    breadCrumbs.push(...this.getTaskCategoryBreadCrumbs(taskId));
    let currentTask = task;
    const parentTaskChain: BreadCrumbArray = [];
    while (currentTask) {
      parentTaskChain.unshift({
        name: currentTask.title && currentTask.title !== '' ? currentTask.title : 'Untitled Task',
        link: this.getTaskRoute(currentTask._id.toString(), false)
      });
      if (!currentTask.parentTaskId) {
        break;
      }
      currentTask = TaskMapService.getMap()[currentTask.parentTaskId.toString()];
    }
    breadCrumbs.push(...parentTaskChain);
    return breadCrumbs;
  }

  /**
   * Recursively finds the parent ID of the given task that has the same
   * sharedWith array.
   */
  static findParentIdWithSameSharedWith(task: DashboardTask): string {
    if (!task.parentTaskId || task.sharedWith.length === 0) {
      return task._id.toString();
    }
    const parentTask = TaskMapService.getMap()[task.parentTaskId.toString()];
    if (!parentTask) {
      return task._id.toString();
    }
    // Fancy array comparison logic
    if (
      parentTask.sharedWith.length === task.sharedWith.length &&
      parentTask.sharedWith
        .map((id) => id.toString())
        .sort()
        .join() ===
        task.sharedWith
          .map((id) => id.toString())
          .sort()
          .join()
    ) {
      return this.findParentIdWithSameSharedWith(parentTask);
    }
    return task._id.toString();
  }

  static getTaskCategoryRoute(taskId: string, includeFirstSlash = true) {
    const defaultRoute = `${includeFirstSlash ? '/' : ''}tasks`;
    const task = TaskMapService.getMap()[taskId];
    if (!task) {
      return defaultRoute;
    }
    switch (task.category) {
      case 'default':
        return defaultRoute;
      default:
        return defaultRoute;
    }
  }
}
