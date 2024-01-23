<script lang="ts">
  import type { DashboardTagSetting } from '@aneuhold/core-ts-db-lib';
  import Card, { Content } from '@smui/card';
  import type { MenuButtonItem } from 'components/presentational/MenuButton.svelte';
  import MenuButton from 'components/presentational/MenuButton.svelte';
  import { createEventDispatcher } from 'svelte';
  import TaskTagsService from '../../../services/Task/TaskTagsService';
  import { userSettings } from '../../../stores/userSettings';

  export let tagName: string;

  $: tagSettings = $userSettings.config.tagSettings[tagName];
  $: menuItems = getMenuItems(tagSettings);

  const dispatch = createEventDispatcher<{
    openEditor: string;
  }>();

  const getMenuItems = (tagSettings: DashboardTagSetting) => {
    const menuItems: MenuButtonItem[] = [
      {
        title: 'Edit',
        iconName: 'edit',
        clickAction: () => {
          dispatch('openEditor', tagName);
        }
      },
      {
        title: 'Delete',
        iconName: 'delete',
        clickAction: () => {
          TaskTagsService.deleteTag(tagName);
        }
      }
    ];
    if (tagSettings.priority !== 0) {
      menuItems.push({
        title: 'Remove priority',
        iconName: 'remove',
        clickAction: removePriorityFromTag
      });
    } else {
      menuItems.push({
        title: 'Add priority',
        iconName: 'add',
        clickAction: addPriorityToTag
      });
    }
    return menuItems;
  };

  const addPriorityToTag = () => {
    userSettings.update((settings) => {
      Object.keys(settings.config.tagSettings).forEach((otherTagName) => {
        // Increment all the existing non-zero tags priority by 1
        if (otherTagName !== tagName && settings.config.tagSettings[otherTagName].priority !== 0) {
          settings.config.tagSettings[otherTagName].priority += 1;
        }
      });
      settings.config.tagSettings[tagName].priority = 1;
      return settings;
    });
    userSettings.saveSettings();
  };

  const removePriorityFromTag = () => {
    userSettings.update((settings) => {
      Object.keys(settings.config.tagSettings).forEach((otherTagName) => {
        // Decrement all the existing non-zero tags priority by 1 that are
        // higher than the current tag
        const otherTagPriority = settings.config.tagSettings[otherTagName].priority;
        if (
          otherTagName !== tagName &&
          otherTagPriority !== 0 &&
          otherTagPriority > tagSettings.priority
        ) {
          settings.config.tagSettings[otherTagName].priority -= 1;
        }
      });
      settings.config.tagSettings[tagName].priority = 0;
      return settings;
    });
    userSettings.saveSettings();
  };
</script>

<div>
  <Card variant="outlined">
    <Content class="tagRowContent">
      <div class="card-content">
        <div class="left-side">
          <h4 class="mdc-typography--body1 title">
            {tagName}
          </h4>
          {#if tagSettings.priority !== 0}
            <span class="mdc-deprecated-list-item__secondary-text subtitle">
              Priority: {tagSettings.priority}
            </span>
          {/if}
        </div>
        <MenuButton {menuItems} />
      </div>
    </Content>
  </Card>
</div>

<style>
  * :global(.tagRowContent) {
    padding: 0px 8px;
    padding-left: 16px;
  }
  .title {
    margin-top: 0px;
    margin-bottom: -5px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
  }
  .subtitle {
    margin-top: 4px;
    margin-bottom: 0px;
    text-wrap: wrap;
  }
  /* Fixes a weird issue with mdc-deprecated-list-item__secondary-text */
  .subtitle::before {
    display: none;
  }
  .card-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .left-side {
    display: flex;
    flex-direction: row;
    gap: 16px;
    align-items: center;
  }
</style>
