<script lang="ts">
  import { userSettings } from '../../../stores/userSettings';
  import GlobalTagRow from './GlobalTagRow.svelte';

  $: tagSettings = $userSettings.config.tagSettings;
  $: tagList = Object.keys(tagSettings).sort((a, b) => {
    return tagSettings[b].priority - tagSettings[a].priority;
  });
</script>

<div class="container">
  <span class="mdc-typography--subtitle1">Global Task Tag Settings</span>
  {#each tagList as tagName}
    <GlobalTagRow {tagName} />
  {/each}
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0px 8px;
  }
</style>
