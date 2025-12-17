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
  });
});
