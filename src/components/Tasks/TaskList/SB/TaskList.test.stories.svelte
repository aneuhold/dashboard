<script module lang="ts">
  import {
    DashboardTaskListSortSettingsSchema,
    DashboardTaskSortBy,
    DashboardTaskSortDirection
  } from '@aneuhold/core-ts-db-lib';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, userEvent, waitFor, within } from 'storybook/test';
  import { tick } from 'svelte';
  import sbTaskListMetaBase from '$components/Tasks/TaskList/SB/TaskList.stories.base';
  import { MockTaskDescription } from '$services/Task/TaskMapService/TaskMapService.mock';
  import { userConfig } from '$stores/local/userConfig/userConfig';
  import TestUsers from '$testUtils/TestUsers';

  const { Story } = defineMeta({
    ...sbTaskListMetaBase,
    title: 'Stateful Components/TaskList/Tests',
    tags: ['test']
  });
</script>

<!--
  This reproduces an issue where after duplicating tasks multiple times while sorting is enabled,
  the row menus would no longer open. This story ensures that the issue does not regress.
-->
<Story
  name="Menu Bug"
  args={{ numTasks: 10, descriptions: MockTaskDescription.short }}
  beforeEach={() => {
    const currentConfig = userConfig.get();
    const sortSettings = DashboardTaskListSortSettingsSchema.parse({
      userId: TestUsers.currentUserCto._id
    });
    // Sort by Title Ascending
    sortSettings.sortList = [
      {
        sortBy: DashboardTaskSortBy.title,
        sortDirection: DashboardTaskSortDirection.ascending
      }
    ];
    currentConfig.config.taskListSortSettings.default = sortSettings;
    userConfig.setWithoutPropagation(currentConfig);
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const openMenu = async (taskTitle: string) => {
      const titleEl = await canvas.findByText(taskTitle);
      const row = titleEl.closest<HTMLElement>('.card-content');
      if (!row) throw new Error('Row not found for ' + taskTitle);
      const menuBtn = within(row).getByRole('button', { name: 'menu' });
      await userEvent.click(menuBtn);
    };

    const clickDuplicate = async () => {
      // Menu is portaled to body. We want the one that is strictly open.
      const openMenuSurface = await waitFor(() => {
        const openSurface = document.querySelector<HTMLElement>('.mdc-menu-surface--open');
        if (!openSurface) throw new Error('No open menu surface found');
        return openSurface;
      });

      const duplicateBtn = await within(openMenuSurface).findByText('Duplicate');
      await userEvent.click(duplicateBtn);
      await tick();
    };

    // 1) Duplicate a row via its menu.
    await openMenu('Test Task 3');
    await clickDuplicate();

    // 2) Duplicate again (this is where the bug typically starts to show up).
    await openMenu('Test Task 3');
    await clickDuplicate();

    // 3) Ensure a different row's menu can still be opened.
    await openMenu('Test Task 9');

    // Assert menu is visible
    const openSurface = await waitFor(() => {
      const el = document.querySelector<HTMLElement>('.mdc-menu-surface--open');
      if (!el) throw new Error('No open menu surface found');
      return el;
    });

    await expect(within(openSurface).getByText('Edit')).toBeVisible();
  }}
/>
