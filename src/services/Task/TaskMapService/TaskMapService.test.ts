import {
  type DashboardTask,
  DashboardTaskSchema,
  DashboardUserConfigSchema,
  DocumentService
} from '@aneuhold/core-ts-db-lib';
import { DateService } from '@aneuhold/core-ts-lib';
import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userConfig } from '$stores/local/userConfig/userConfig';
import DashboardTaskAPIService from '$util/api/DashboardTaskAPIService';
import { TaskMapService } from './TaskMapService';

// Mock dependencies
vi.mock('$util/LocalData/LocalData', () => ({
  default: {
    setAndGetTaskMap: vi.fn((map) => map),
    taskMap: null
  }
}));

describe('TaskMapService', () => {
  const userId = '019b24cc-e129-70e0-8e9e-ff72c0cbe78d';
  const otherUserId = '019b24cc-e129-70e0-8e9e-ff72c0cbe78e';
  const updateTasksSpy = vi.spyOn(DashboardTaskAPIService, 'updateTasks');

  const createTask = (overrides: Partial<DashboardTask> = {}): DashboardTask => {
    return DashboardTaskSchema.parse({
      userId,
      title: 'Test Task',
      ...overrides
    });
  };

  const createUserConfig = () => {
    return {
      config: DashboardUserConfigSchema.parse({
        userId,
        autoTaskDeletionDays: 30,
        email: 'test@test.com'
      }),
      collaborators: {}
    };
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Spy on userConfig.get
    vi.spyOn(userConfig, 'get').mockReturnValue(createUserConfig());

    // Reset store
    TaskMapService.getStore().set({});
  });

  afterEach(() => {
    TaskMapService.getStore().set({});
  });

  it('should initialize with empty map', () => {
    expect(get(TaskMapService.getStore())).toEqual({});
  });

  describe('Auto Deletion', () => {
    it('should auto-delete old completed tasks', () => {
      const oldDate = DateService.addDays(new Date(), -40);
      const recentDate = DateService.addDays(new Date(), -10);

      const oldTask = createTask({
        title: 'Old Task',
        completed: true,
        lastUpdatedDate: oldDate,
        createdDate: oldDate
      });

      const recentTask = createTask({
        title: 'Recent Task',
        completed: true,
        lastUpdatedDate: recentDate,
        createdDate: recentDate
      });

      const incompleteTask = createTask({
        title: 'Incomplete Task',
        completed: false,
        lastUpdatedDate: oldDate,
        createdDate: oldDate
      });

      // We need to set the map directly to simulate loading from DB/LocalData
      // calling set() triggers afterMapSet which triggers autoDeleteTasksPostSet
      TaskMapService.getStore().set({
        [oldTask._id]: oldTask,
        [recentTask._id]: recentTask,
        [incompleteTask._id]: incompleteTask
      });

      // Wait for any async operations or just check if deleteMany was called
      // deleteMany is synchronous in DocumentMapStoreService, but let's check if it was called
      // The issue might be that deleteMany calls persistToDb which is mocked.
      // But deleteMany also updates the map.

      const map = get(TaskMapService.getStore());
      expect(map[oldTask._id]).toBeUndefined();
      expect(map[recentTask._id]).toBeDefined();
      expect(map[incompleteTask._id]).toBeDefined();

      expect(updateTasksSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          delete: expect.arrayContaining([expect.objectContaining({ _id: oldTask._id })])
        })
      );
    });

    it('should not auto-delete tasks with parents', () => {
      const oldDate = DateService.addDays(new Date(), -31);
      const parentId = DocumentService.generateID();

      const oldChildTask = createTask({
        title: 'Old Child Task',
        completed: true,
        lastUpdatedDate: oldDate,
        createdDate: oldDate,
        parentTaskId: parentId
      });

      TaskMapService.getStore().set({
        [oldChildTask._id]: oldChildTask
      });

      const map = get(TaskMapService.getStore());
      expect(map[oldChildTask._id]).toBeDefined();
    });
  });

  describe('User ID Inheritance', () => {
    it('should inherit userId from parent task on addition', () => {
      const parentTask = createTask({
        title: 'Parent Task'
      });

      TaskMapService.getStore().addDoc(parentTask);

      const childTask = createTask({
        // Intentionally wrong or missing userId to test inheritance
        userId: otherUserId,
        title: 'Child Task',
        parentTaskId: parentTask._id
      });

      TaskMapService.getStore().addDoc(childTask);

      const map = get(TaskMapService.getStore());
      expect(map[childTask._id]?.userId).toBe(userId);
    });
  });

  describe('Cascading Deletion', () => {
    it('should delete children when parent is deleted', () => {
      const parentTask = createTask({
        title: 'Parent Task'
      });

      const childTask = createTask({
        title: 'Child Task',
        parentTaskId: parentTask._id
      });

      TaskMapService.getStore().set({
        [parentTask._id]: parentTask,
        [childTask._id]: childTask
      });

      TaskMapService.getStore().deleteDoc(parentTask._id);

      const map = get(TaskMapService.getStore());
      expect(map[parentTask._id]).toBeUndefined();
      expect(map[childTask._id]).toBeUndefined();

      expect(updateTasksSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          delete: expect.arrayContaining([
            expect.objectContaining({ _id: parentTask._id }),
            expect.objectContaining({ _id: childTask._id })
          ])
        })
      );
    });
  });
});
