import { type DashboardTask, type DocumentMap } from '@aneuhold/core-ts-db-lib';
import { describe, expect, it } from 'vitest';
import { createTestTask } from '../../../testUtils/TaskTestUtils';
import TestUsers from '../../../testUtils/TestUsers';
import TaskSharingService from './TaskSharingService';

describe('TaskSharingService', () => {
  const otherUserId = TestUsers.collaborator1._id;

  describe('getSubscribersForTaskMap', () => {
    const subscribers = TaskSharingService.getSubscribersForTaskMap();

    describe('beforeDocAddition', () => {
      it('should inherit sharedWith from parent task', () => {
        const parentTask = createTestTask({
          sharedWith: [otherUserId]
        });
        const childTask = createTestTask({
          parentTaskId: parentTask._id,
          sharedWith: []
        });

        const map: DocumentMap<DashboardTask> = {
          [parentTask._id]: parentTask
        };

        if (subscribers.beforeDocAddition) {
          const result = subscribers.beforeDocAddition(map, childTask);
          expect(result.sharedWith).toContain(otherUserId);
        } else {
          throw new Error('beforeDocAddition subscriber not defined');
        }
      });

      it('should not change sharedWith if no parent task', () => {
        const task = createTestTask({
          sharedWith: []
        });
        const map: DocumentMap<DashboardTask> = {};

        if (subscribers.beforeDocAddition) {
          const result = subscribers.beforeDocAddition(map, task);
          expect(result.sharedWith).toEqual([]);
        }
      });
    });

    describe('validateDocUpdate', () => {
      it('should propagate sharedWith changes to children', () => {
        const parentTask = createTestTask({
          sharedWith: []
        });
        const updatedParentTask = createTestTask({
          ...parentTask,
          sharedWith: [otherUserId]
        });

        const childTask = createTestTask({
          parentTaskId: parentTask._id,
          sharedWith: []
        });

        const map: DocumentMap<DashboardTask> = {
          [parentTask._id]: parentTask,
          [childTask._id]: childTask
        };

        if (subscribers.validateDocUpdate) {
          const result = subscribers.validateDocUpdate(map, parentTask, updatedParentTask);

          expect(result).not.toBeNull();
          if (result) {
            // Check filter
            expect(result.filter(childTask)).toBe(true);

            // Check updater
            const updatedChild = result.updater(createTestTask({ sharedWith: [] }));
            expect(updatedChild.sharedWith).toContain(otherUserId);
          }
        } else {
          throw new Error('validateDocUpdate subscriber not defined');
        }
      });

      it('should return null if sharedWith has not changed', () => {
        const task = createTestTask({ sharedWith: [otherUserId] });
        const updatedTask = createTestTask({ ...task, title: 'New Title' });
        const map: DocumentMap<DashboardTask> = { [task._id]: task };

        if (subscribers.validateDocUpdate) {
          const result = subscribers.validateDocUpdate(map, task, updatedTask);
          expect(result).toBeNull();
        }
      });
    });
  });
});
