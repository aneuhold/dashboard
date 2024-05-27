<!--
  @component
  
  A tags selector for a specific task.
-->
<script lang="ts">
  import { currentUserId } from '$stores/derived/currentUserId';
  import Autocomplete from '@smui-extra/autocomplete';
  import Chip, { Set, Text, TrailingAction } from '@smui/chips';
  import { TaskMapService } from '../../../services/Task/TaskMapService';
  import TaskTagsService from '../../../services/Task/TaskTagsService';

  export let taskId: string;

  $: task = TaskMapService.getTaskStore(taskId);
  $: globalTags = TaskTagsService.getStore();
  $: unselectedTags = $globalTags.filter((tag) => !$task.tags[$currentUserId]?.includes(tag));
  // This needs to be redirected like this so that the Set component doesn't
  // make a small write on startup.
  $: currentUserTags = $task.tags[$currentUserId] ?? [];

  let currentAutoCompleteValue = '';
  let selector: Autocomplete;

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
    selector.focus();
  }

  function handleSelection(event: CustomEvent<string>) {
    // Don't actually select the item.
    event.preventDefault();
    checkAndAddNewTag(event.detail);
  }

  /**
   * Handles removal. The actual event is an internal MDC Chip Removal event.
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
      <Set bind:chips={currentUserTags} on:SMUIChip:removal={handleRemoval} let:chip>
        <Chip {chip}>
          <Text>{chip}</Text>
          <TrailingAction icon$class="material-icons">cancel</TrailingAction>
        </Chip>
      </Set>
    {/if}
  </div>

  <Autocomplete
    bind:this={selector}
    options={unselectedTags}
    bind:text={currentAutoCompleteValue}
    on:keydown={handleKeyDown}
    noMatchesActionDisabled={false}
    selectOnExactMatch={false}
    showMenuWithNoInput={false}
    clearOnBlur={false}
    label="Add Tag"
    on:SMUIAutocomplete:noMatchesAction={handleNewSelection}
    on:SMUIAutocomplete:selected={handleSelection}
  >
    <div slot="no-matches">
      {#if currentUserTags.includes(currentAutoCompleteValue)}
        <Text>Tag "{currentAutoCompleteValue}" already added</Text>
      {:else}
        <Text>Add tag "{currentAutoCompleteValue}"</Text>
      {/if}
    </div>
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
