import '@testing-library/jest-dom/vitest';
import {
  DashboardTaskListSortSettingsSchema,
  DashboardTaskSortBy,
  DashboardTaskSortDirection
} from '@aneuhold/core-ts-db-lib';
import { waitFor } from '@testing-library/dom';
import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import TaskListService from '$services/Task/TaskListService';
import taskMapService from '$services/Task/TaskMapService/TaskMapService';
import TaskMapServiceMock from '$services/Task/TaskMapService/TaskMapService.mock';
import { userConfig } from '$stores/local/userConfig/userConfig';
import TestUsers from '$testUtils/TestUsers';
import TaskList from './TaskList.svelte';

vi.mock('$app/navigation', () => {
  return {
    goto: vi.fn()
  };
});

vi.mock(
  '$components/singletons/dialogs/SingletonTaskAssignmentDialog/SingletonTaskAssignmentDialog.svelte',
  () => {
    return {
      taskAssignmentDialog: {
        open: vi.fn()
      }
    };
  }
);

vi.mock(
  '$components/singletons/dialogs/SingletonTaskSharingDialog/SingletonTaskSharingDialog.svelte',
  () => {
    return {
      taskSharingDialog: {
        open: vi.fn()
      }
    };
  }
);

describe('TaskList', () => {
  /**
   * This reproduces an issue where after duplicating tasks multiple times while sorting is enabled,
   * the row menus would no longer open. This test ensures that the issue does not regress.
   */
  it('keeps row menus openable after duplicating twice with sorting enabled', async () => {
    const user = userEvent.setup();

    const userId = TestUsers.currentUserCto._id;
    const mockService = new TaskMapServiceMock(userId);
    mockService.reset();

    // Force a non-empty sort list so we are in the "sorting enabled" code path.
    const currentConfig = userConfig.get();
    const sortSettings = DashboardTaskListSortSettingsSchema.parse({ userId });
    sortSettings.sortList = [
      {
        sortBy: DashboardTaskSortBy.dueDate,
        sortDirection: DashboardTaskSortDirection.descending
      }
    ];
    currentConfig.config.taskListSortSettings.default = sortSettings;
    userConfig.setWithoutPropagation(currentConfig);

    const baseDate = new Date('2026-01-01T00:00:00.000Z');
    for (let i = 0; i < 10; i++) {
      mockService.addTask({
        title: `Test Task ${i + 1}`,
        dueDate: new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000)
      });
    }

    const getSortAndFilterResult = () => {
      return TaskListService.getTaskIds(taskMapService.mapState, userConfig.get(), 'default');
    };

    const { rerender } = render(TaskList, {
      category: 'default',
      sortAndFilterResult: getSortAndFilterResult()
    });

    const getOpenMenuSurface = (): HTMLElement | null => {
      const el = document.querySelector('.mdc-menu-surface--open');
      return el instanceof HTMLElement ? el : null;
    };

    const openRowMenu = async (taskTitle: string) => {
      const titleNode = screen.getByText(taskTitle);
      const row = titleNode.closest<HTMLElement>('.card-content');
      if (!row) {
        throw new Error(`Could not find row container for task title: ${taskTitle}`);
      }

      const menuButton = within(row).getByRole('button', { name: 'menu' });
      await user.click(menuButton);
      await tick();

      await waitFor(() => {
        expect(getOpenMenuSurface()).not.toBeNull();
      });
    };

    const clickDuplicate = async () => {
      const openSurface = getOpenMenuSurface();
      if (!openSurface) {
        throw new Error('Expected an open menu surface, but none was found.');
      }

      // The MenuButton uses SMUI List Item without explicit ARIA; the visible text is the
      // most stable selector for this test. Scope it to the currently open surface to avoid
      // matching the many hidden menu instances for other rows.
      await user.click(within(openSurface).getByText('Duplicate'));
      await tick();
    };

    const rerenderWithLatestSort = async () => {
      await rerender({
        category: 'default',
        sortAndFilterResult: getSortAndFilterResult()
      });
    };

    // 1) Duplicate a row via its menu.
    await openRowMenu('Test Task 3');
    await clickDuplicate();
    await rerenderWithLatestSort();

    // 2) Duplicate again (this is where the bug typically starts to show up when sorting is enabled).
    await openRowMenu('Test Task 3');
    await clickDuplicate();
    await rerenderWithLatestSort();

    // 3) Ensure a different row's menu can still be opened.
    await openRowMenu('Test Task 9');

    // At least one menu-surface should be open and the menu items should exist in the DOM.
    const openSurface = getOpenMenuSurface();
    expect(openSurface).not.toBeNull();
    expect(document.querySelectorAll('.mdc-menu-surface--open').length).toBe(1);
    if (!openSurface) {
      throw new Error('Expected an open menu surface, but none was found.');
    }
    expect(within(openSurface).getByText('Edit')).toBeInTheDocument();
    expect(within(openSurface).getByText('Duplicate')).toBeInTheDocument();
    expect(within(openSurface).getByText('Delete')).toBeInTheDocument();
  });
});
