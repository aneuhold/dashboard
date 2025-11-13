<!--
  @component
  
  A tags selector for a specific task.
-->
<script lang="ts">
  import Chip, { Set, Text, TrailingAction } from '@smui/chips';
  import Autocomplete from '@smui-extra/autocomplete';
  import { TaskMapService } from '$services/Task/TaskMapService/TaskMapService';
  import TaskTagsService from '$services/Task/TaskTagsService';
  import { currentUserId } from '$stores/derived/currentUserId';

  let {
    taskId
  }: {
    taskId: string;
  } = $props();

  const globalTags = TaskTagsService.getStore(TaskMapService.getStore());

  let task = $derived(TaskMapService.getTaskStore(taskId));
  let unselectedTags = $derived(
    $globalTags.filter((tag) => !$task.tags[$currentUserId]?.includes(tag))
  );
  // This needs to be redirected like this so that the Set component doesn't
  // make a small write on startup.
  let currentUserTags = $derived($task.tags[$currentUserId] ?? []);

  let currentAutoCompleteValue = $state('');
  let selector: Autocomplete | undefined = $state();

  function addTagToTask(tag: string) {
    const newTagsObject = $task.tags;
    const currentUserTagsArray = newTagsObject[$currentUserId] ?? [];
    currentUserTagsArray.push(tag);
    newTagsObject[$currentUserId] = currentUserTagsArray;
    $task.tags = newTagsObject;
  }

  function checkAndAddNewTag(newTag: string) {
    if (newTag === '' || currentUserTags.includes(newTag)) return;
    addTagToTask(newTag);
    currentAutoCompleteValue = '';
    selector?.focus();
  }

  function handleSelection(event: CustomEvent<string>) {
    // Don't actually select the item.
    event.preventDefault();
    checkAndAddNewTag(event.detail);
  }

  /**
   * Handles removal of a tag chip.
   *
   * @param event - The chip removal event containing chipId.
   */
  function handleRemoval(event: CustomEvent<{ chipId: string }>) {
    let currentUserTags = $task.tags[$currentUserId];
    if (!currentUserTags) return;
    currentUserTags = currentUserTags.filter((tag) => tag !== event.detail.chipId);
    if (currentUserTags.length === 0) {
      delete $task.tags[$currentUserId];
      $task.tags = $task.tags;
    } else {
      $task.tags[$currentUserId] = currentUserTags;
    }
  }

  function handleNewSelection() {
    checkAndAddNewTag(currentAutoCompleteValue);
  }

  function handleKeyDown(event: CustomEvent | KeyboardEvent) {
    event = event as KeyboardEvent;
    if (event.key === 'Enter') {
      handleNewSelection();
    }
  }
</script>

<div class={`tagsSelectorContainer${currentUserTags.length > 0 ? ' reducedTopMargin' : ''}`}>
  <div class="tagChipsContainer">
    {#if currentUserTags.length === 0}
      <i class="mdc-typography--body2 subTasksTitle dimmed-color">No tags</i>
    {:else}
      <span>Tags</span>
      <Set bind:chips={currentUserTags} onSMUIChipRemoval={handleRemoval}>
        {#snippet chip(chip)}
          <Chip {chip}>
            <Text>{chip}</Text>
            <TrailingAction icon$class="material-icons">cancel</TrailingAction>
          </Chip>
        {/snippet}
      </Set>
    {/if}
  </div>

  <Autocomplete
    bind:this={selector}
    options={unselectedTags}
    bind:text={currentAutoCompleteValue}
    onkeydown={handleKeyDown}
    noMatchesActionDisabled={false}
    selectOnExactMatch={false}
    showMenuWithNoInput={false}
    clearOnBlur={false}
    label="Add Tag"
    onSMUIAutocompleteNoMatchesAction={handleNewSelection}
    onSMUIAutocompleteSelected={handleSelection}
  >
    {#snippet noMatches()}
      {#if currentUserTags.includes(currentAutoCompleteValue)}
        <Text>Tag "{currentAutoCompleteValue}" already added</Text>
      {:else}
        <Text>Add tag "{currentAutoCompleteValue}"</Text>
      {/if}
    {/snippet}
  </Autocomplete>
</div>

<style>
  .tagsSelectorContainer {
    display: flex;
    flex-direction: column;
  }
  .tagChipsContainer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }
  .reducedTopMargin {
    margin-top: -8px;
  }
</style>
