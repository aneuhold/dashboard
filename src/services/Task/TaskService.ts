import type { BreadCrumbArray } from '$components/BreadCrumb.svelte';
import { confirmationDialog } from '$components/singletons/dialogs/SingletonConfirmationDialog.svelte';
import type { DashboardTask } from '@aneuhold/core-ts-db-lib';
import { ArrayService } from '@aneuhold/core-ts-lib';
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
    let currentTask: DashboardTask | undefined = task;
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
   * A generic method for handling the delete click for a task.
   */
  static handleDeleteTaskClick(
    allChildrenIdsLength: number,
    deleteTaskCallback: () => void,
    taskTitle?: string
  ) {
    if (allChildrenIdsLength > 0) {
      confirmationDialog.open({
        title: 'Delete Task',
        message: `Are you sure you want to delete ${
          !taskTitle || taskTitle === '' ? 'this task' : `"${taskTitle}"`
        }? It has ${allChildrenIdsLength} sub task${allChildrenIdsLength > 1 ? 's' : ''}.`,
        confirmationButtonText: 'Delete',
        onConfirm: deleteTaskCallback
      });
      return;
    }
    deleteTaskCallback();
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
    if (
      ArrayService.arraysHaveSamePrimitiveValues(
        task.sharedWith.map((id) => id.toString()),
        parentTask.sharedWith.map((id) => id.toString())
      )
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
