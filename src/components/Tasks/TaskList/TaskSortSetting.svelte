<script lang="ts">
  import {
    DashboardTaskSortBy,
    DashboardTaskSortDirection,
    type DashboardTaskSortSetting
  } from '@aneuhold/core-ts-db-lib';
  import Card, { Content } from '@smui/card';
  import Checkbox from '@smui/checkbox';
  import IconButton, { Icon } from '@smui/icon-button';
  import SegmentedButton, { Segment } from '@smui/segmented-button';
  import { createEventDispatcher } from 'svelte';

  export let sortSetting: DashboardTaskSortSetting;
  export let disabled: boolean;

  $: sortName = getSortName(sortSetting.sortBy);
  $: tagContentClass = disabled ? 'card-content dimmed-color' : 'card-content colorWhite';

  type SortDirectionChoice = {
    value: DashboardTaskSortDirection;
    iconName: string;
  };

  const sortDirectionChoices: SortDirectionChoice[] = [
    {
      value: DashboardTaskSortDirection.descending,
      iconName: 'arrow_downward'
    },
    {
      value: DashboardTaskSortDirection.ascending,
      iconName: 'arrow_upward'
    }
  ];
  $: sortDirectionChoice = sortDirectionChoices.find(
    (choice) => choice.value === sortSetting.sortDirection
  );

  const dispatch = createEventDispatcher<{
    enable: DashboardTaskSortBy;
    disable: DashboardTaskSortBy;
    incrementPriority: DashboardTaskSortBy;
    decrementPriority: DashboardTaskSortBy;
  }>();

  const enable = () => {
    dispatch('enable', sortSetting.sortBy);
  };
  const disable = () => {
    dispatch('disable', sortSetting.sortBy);
  };
  const incrementPriority = () => {
    dispatch('incrementPriority', sortSetting.sortBy);
  };
  const decrementPriority = () => {
    dispatch('decrementPriority', sortSetting.sortBy);
  };
  const getSortName = (sortBy: DashboardTaskSortBy) => {
    switch (sortBy) {
      case DashboardTaskSortBy.tags:
        return 'Tags';
      case DashboardTaskSortBy.title:
        return 'Title';
      case DashboardTaskSortBy.dueDate:
        return 'Due Date';
      case DashboardTaskSortBy.startDate:
        return 'Start Date';
      case DashboardTaskSortBy.createdDate:
        return 'Created Date';
      case DashboardTaskSortBy.lastUpdatedDate:
        return 'Last Updated Date';
      default:
        return 'Unknown';
    }
  };
</script>

<div>
  <Card variant="outlined">
    <Content class="tagRowContent">
      <div class={tagContentClass}>
        <div class="iconSet leftIconSet">
          <Checkbox
            checked={!disabled}
            touch
            class="tagCheckbox"
            on:click={() => {
              if (disabled) {
                enable();
              } else {
                disable();
              }
            }}
          />
          {#if !disabled}
            <IconButton size="button" on:click={decrementPriority}>
              <Icon class="material-icons">arrow_downward</Icon>
            </IconButton>
            <IconButton size="button" on:click={incrementPriority}>
              <Icon class="material-icons">arrow_upward</Icon>
            </IconButton>
          {/if}
        </div>
        <h4 class="mdc-typography--body1 text">
          {sortName}
        </h4>
        {#if !disabled}
          <div class="iconSet">
            <SegmentedButton
              segments={sortDirectionChoices}
              let:segment
              singleSelect
              selected={sortDirectionChoice}
              key={(segment) => segment.value}
              class="tagSegmentedButton"
            >
              <Segment
                {segment}
                title={segment.value}
                on:click$preventDefault={() => {
                  sortSetting.sortDirection = segment.value;
                }}
              >
                <Icon class="material-icons">{segment.iconName}</Icon>
              </Segment>
            </SegmentedButton>
          </div>
        {/if}
      </div>
    </Content>
  </Card>
</div>

<style>
  * :global(.tagRowContent) {
    padding: 0px;
  }
  * :global(.tagCheckbox) {
    margin: 0px;
  }
  * :global(.tagSegmentedButton) {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
  }
  .colorWhite {
    color: var(--mdc-theme-on-primary);
  }
  .text {
    margin-top: 4px;
    margin-bottom: 4px;
  }
  .card-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-right: 8px;
  }
  .iconSet {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
  }
  .leftIconSet {
    margin-right: -4px;
  }
</style>
