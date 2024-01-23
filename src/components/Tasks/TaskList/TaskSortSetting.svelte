<script lang="ts">
  import { DashboardTaskSortBy, type DashboardTaskSortSetting } from '@aneuhold/core-ts-db-lib';
  import Card, { Content } from '@smui/card';
  import Checkbox from '@smui/checkbox';
  import IconButton, { Icon } from '@smui/icon-button';
  import { createEventDispatcher } from 'svelte';

  export let sortSetting: DashboardTaskSortSetting;
  export let disabled: boolean;

  $: sortName = getSortName(sortSetting.sortBy);
  $: tagContentClass = disabled ? 'card-content dimmed-color' : 'card-content colorWhite';

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
        <Checkbox
          checked={!disabled}
          touch
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
        <h4 class="mdc-typography--body1 text">
          {sortName}
        </h4>
      </div>
    </Content>
  </Card>
</div>

<style>
  * :global(.tagRowContent) {
    padding: 0px;
  }
  .colorWhite {
    /* Update this to use MDC variable */
    color: white;
  }
  .text {
    margin-top: 0px;
    margin-bottom: 0px;
  }
  .card-content {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
</style>
