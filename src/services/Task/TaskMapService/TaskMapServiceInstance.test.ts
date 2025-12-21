import {
  type DashboardTask,
  DashboardTaskSchema,
  DashboardUserConfigSchema,
  DocumentService
} from '@aneuhold/core-ts-db-lib';
import { DateService } from '@aneuhold/core-ts-lib';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userConfig } from '$stores/local/userConfig/userConfig';
import DashboardTaskAPIService from '$util/api/DashboardTaskAPIService';
import TaskTagsService from '../TaskTagsService';
import taskMapService, { TaskMapService } from './TaskMapService';

// Mock dependencies
vi.mock('$util/LocalData/LocalData', () => ({
  default: {
    setAndGetTaskMap: vi.fn((map) => map),
    taskMap: null
  }
}));

describe('TaskMapService (Instance)', () => {
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

  let currentUserConfig = createUserConfig();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    currentUserConfig = createUserConfig();

    // Spy on userConfig.get
    vi.spyOn(userConfig, 'get').mockImplementation(() => currentUserConfig);

    // Spy on userConfig.update
    vi.spyOn(userConfig, 'update').mockImplementation((updater) => {
      currentUserConfig = updater(currentUserConfig);
    });

    // Reset map
    taskMapService.setMap({});
  });

  afterEach(() => {
    taskMapService.setMap({});
  });

  it('should initialize with empty map', () => {
    expect(taskMapService.mapState).toEqual({});
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

      // Use setMap to simulate loading from DB/LocalData
      taskMapService.setMap({
        [oldTask._id]: oldTask,
        [recentTask._id]: recentTask,
        [incompleteTask._id]: incompleteTask
      });

      const map = taskMapService.mapState;
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

      taskMapService.setMap({
        [oldChildTask._id]: oldChildTask
      });

      const map = taskMapService.mapState;
      expect(map[oldChildTask._id]).toBeDefined();
    });
  });

  describe('User ID Inheritance', () => {
    it('should inherit userId from parent task on addition', () => {
      const parentTask = createTask({
        title: 'Parent Task'
      });

      taskMapService.addDoc(parentTask);

      const childTask = createTask({
        // Intentionally wrong or missing userId to test inheritance
        userId: otherUserId,
        title: 'Child Task',
        parentTaskId: parentTask._id
      });

      taskMapService.addDoc(childTask);

      const map = taskMapService.mapState;
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

      taskMapService.setMap({
        [parentTask._id]: parentTask,
        [childTask._id]: childTask
      });

      taskMapService.deleteDoc(parentTask._id);

      const map = taskMapService.mapState;
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

  describe('updateSharedWith', () => {
    it('should update sharedWith and propagate to children', () => {
      const parentTask = createTask({ sharedWith: [] });
      const childTask = createTask({ parentTaskId: parentTask._id, sharedWith: [] });

      taskMapService.setMap({
        [parentTask._id]: parentTask,
        [childTask._id]: childTask
      });

      taskMapService.updateSharedWith(parentTask._id, [otherUserId]);

      const map = taskMapService.mapState;
      expect(map[parentTask._id]?.sharedWith).toContain(otherUserId);
      expect(map[childTask._id]?.sharedWith).toContain(otherUserId);
    });
  });

  describe('updateTags', () => {
    it('should update tags and notify individual task store subscribers', () => {
      // Initialize TaskTagsService to ensure userId is set
      TaskTagsService.getStore(TaskMapService.getStore());

      const task = createTask();
      taskMapService.setMap({ [task._id]: task });

      const newTags = ['tag1', 'tag2'];

      taskMapService.updateTags(task._id, newTags);

      // Verify map is updated
      const map = taskMapService.mapState;
      expect(map[task._id]?.tags[userId]).toEqual(newTags);

      // Verify user config was updated (via TaskTagsService)
      const config = userConfig.get();
      expect(config.config.tagSettings['tag1']).toBeDefined();
      expect(config.config.tagSettings['tag2']).toBeDefined();
    });

    it('should remove tags entry if empty', () => {
      const task = createTask({
        tags: { [userId]: ['tag1'] }
      });
      taskMapService.setMap({ [task._id]: task });

      taskMapService.updateTags(task._id, []);

      const map = taskMapService.mapState;
      expect(map[task._id]?.tags[userId]).toBeUndefined();
    });
  });
});
