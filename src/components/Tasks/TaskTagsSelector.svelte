<!--
  @component
  
  A tags selector for a specific task.
-->
<script lang="ts">
  import Autocomplete from '@smui-extra/autocomplete';
  import Chip, { Set, Text, TrailingAction } from '@smui/chips';
  import TaskService from 'util/TaskService';

  export let taskId: string;

  $: task = TaskService.getTaskStore(taskId);
  $: globalTags = TaskService.getTaskTagsStore();
  $: unselectedTags = $globalTags.filter((tag) => !$task.tags.includes(tag));
  // This needs to be redirected like this so that the Set component doesn't
  // make a small write on startup.
  $: currentTags = $task.tags;

  let currentAutoCompleteValue = '';
  let selector: Autocomplete;

  function addTagToTask(tag: string) {
    $task.tags.push(tag);
    $task.tags = $task.tags;
  }

  function checkAndAddNewTag(newTag: string) {
    if (newTag === '' || $task.tags.includes(newTag)) return;
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
    $task.tags = $task.tags.filter((tag) => tag !== event.detail.chipId);
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

<div class={`tagsSelectorContainer${$task.tags.length > 0 ? ' reducedTopMargin' : ''}`}>
  <div class="tagChipsContainer">
    {#if $task.tags.length === 0}
      <i class="mdc-typography--body2 subTasksTitle dimmed-color">No tags</i>
    {:else}
      <span>Tags</span>
      <Set bind:chips={currentTags} on:SMUIChip:removal={handleRemoval} let:chip>
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
      {#if $task.tags.includes(currentAutoCompleteValue)}
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
