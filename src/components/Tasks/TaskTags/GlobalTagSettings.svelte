<script lang="ts">
  import { userSettings } from '../../../stores/userSettings';
  import GlobalTagEditor from './GlobalTagEditor.svelte';
  import GlobalTagRow from './GlobalTagRow.svelte';

  $: tagSettings = $userSettings.config.tagSettings;
  $: tagList = Object.keys(tagSettings).sort((a, b) => {
    return tagSettings[b].priority - tagSettings[a].priority;
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
  {#each tagList as tagName}
    <GlobalTagRow {tagName} on:openEditor={handleOpenEditor} />
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
