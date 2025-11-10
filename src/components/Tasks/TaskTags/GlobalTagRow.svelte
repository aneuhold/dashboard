<script lang="ts">
  import type { DashboardTagSetting } from '@aneuhold/core-ts-db-lib';
  import Card, { Content } from '@smui/card';
  import IconButton, { Icon } from '@smui/icon-button';
  import type { MenuButtonItem } from '$components/presentational/MenuButton.svelte';
  import MenuButton from '$components/presentational/MenuButton.svelte';
  import { userSettings } from '$stores/userSettings/userSettings';
  import TaskTagsService from '../../../services/Task/TaskTagsService';

  interface Props {
    tagName: string;
    maxPriority: number;
    onOpenEditor?: (tagName: string) => void;
  }

  let { tagName, maxPriority, onOpenEditor }: Props = $props();

  const getMenuItems = (tagSettings: DashboardTagSetting) => {
    const menuItems: MenuButtonItem[] = [
      {
        title: 'Edit',
        iconName: 'edit',
        clickAction: () => {
          onOpenEditor?.(tagName);
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
    if (tagSettings && tagSettings.priority !== 0) {
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

  const incrementPriority = () => {
    userSettings.update((settings) => {
      Object.keys(settings.config.tagSettings).forEach((otherTagName) => {
        // Increment all the existing non-zero tags priority by 1 that are
        // lower than the current tag
        const otherTagPriority = settings.config.tagSettings[otherTagName].priority;
        if (otherTagPriority === tagSettings.priority + 1) {
          settings.config.tagSettings[otherTagName].priority -= 1;
        }
      });
      settings.config.tagSettings[tagName].priority += 1;
      return settings;
    });
  };

  const decrementPriority = () => {
    userSettings.update((settings) => {
      Object.keys(settings.config.tagSettings).forEach((otherTagName) => {
        // Decrement all the existing non-zero tags priority by 1 that are
        // higher than the current tag
        const otherTagPriority = settings.config.tagSettings[otherTagName].priority;
        if (otherTagPriority === tagSettings.priority - 1) {
          settings.config.tagSettings[otherTagName].priority += 1;
        }
      });
      settings.config.tagSettings[tagName].priority -= 1;
      return settings;
    });
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
  };
  let tagSettings = $derived($userSettings.config.tagSettings[tagName]);
  let menuItems = $derived(getMenuItems(tagSettings));
</script>

<div>
  <Card variant="outlined">
    <Content class="tagRowContent">
      <div class="card-content">
        <div class="left-side">
          {#if tagSettings.priority !== 0}
            <IconButton
              size="button"
              onclick={decrementPriority}
              disabled={tagSettings.priority === 1}
            >
              <Icon class="material-icons">arrow_downward</Icon>
            </IconButton>
            <IconButton
              size="button"
              onclick={incrementPriority}
              disabled={tagSettings.priority === maxPriority}
            >
              <Icon class="material-icons">arrow_upward</Icon>
            </IconButton>
          {/if}
        </div>
        <div class="tagInfo">
          <h4 class="mdc-typography--body1 text">
            {tagName}
          </h4>
          {#if tagSettings.priority !== 0}
            <span class="mdc-deprecated-list-item__secondary-text text">
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
    padding: 0px;
  }
  .text {
    margin-top: 0px;
    margin-bottom: 0px;
  }
  /* Fixes a weird issue with mdc-deprecated-list-item__secondary-text */
  .text::before {
    display: none;
  }
  .card-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;
  }
  .left-side {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
  }
  .tagInfo {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    margin-bottom: 8px;
  }
</style>
