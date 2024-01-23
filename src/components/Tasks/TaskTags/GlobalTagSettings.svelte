<script lang="ts">
  import { flip } from 'svelte/animate';
  import { userSettings } from '../../../stores/userSettings';
  import GlobalTagEditor from './GlobalTagEditor.svelte';
  import GlobalTagRow from './GlobalTagRow.svelte';

  $: tagSettings = $userSettings.config.tagSettings;
  $: sortableTagList = Object.keys(tagSettings)
    .filter((tagName) => {
      return tagSettings[tagName].priority !== 0;
    })
    .sort((a, b) => {
      return tagSettings[b].priority - tagSettings[a].priority;
    });
  $: nonSortableTagList = Object.keys(tagSettings).filter((tagName) => {
    return tagSettings[tagName].priority === 0;
  });

  let editorOpen = false;
  let editorOpenForTag = '';

  const handleOpenEditor = (event: CustomEvent<string>) => {
    editorOpenForTag = event.detail;
    editorOpen = true;
  };
</script>

<div class="container">
  <span class="mdc-typography--subtitle1 title">Global Task Tag Settings</span>
  {#each sortableTagList as tagName (tagName)}
    <div animate:flip={{ duration: 300 }}>
      <GlobalTagRow
        maxPriority={sortableTagList.length}
        {tagName}
        on:openEditor={handleOpenEditor}
      />
    </div>
  {/each}
  {#each nonSortableTagList as tagName}
    <GlobalTagRow maxPriority={sortableTagList.length} {tagName} on:openEditor={handleOpenEditor} />
  {/each}
</div>

<GlobalTagEditor tagName={editorOpenForTag} bind:open={editorOpen} />

<style>
  .container {
    display: flex;
    flex-direction: column;
    margin: 0px 8px;
    gap: 4px;
  }
  .title {
    margin-bottom: 4px;
  }
</style>
