<!--
  @component
  
  A page for settings of the dashboard for the current user.
-->
<script lang="ts" context="module">
  import { goto } from '$app/navigation';
  import Button from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import CircularProgress from '@smui/circular-progress';
  import FormField from '@smui/form-field';
  import Paper, { Content } from '@smui/paper';
  import PageTitle from 'components/PageTitle.svelte';
  import type { PageInfo } from 'util/navInfo';
  import { userSettings } from '../../stores/userSettings';

  export const settingsPageInfo: PageInfo = {
    shortTitle: 'Settings',
    title: 'Settings',
    description: 'Settings for your account',
    url: '/settings',
    iconName: 'settings',
    clickAction: () => {
      goto(settingsPageInfo.url);
    },
    nestingLevel: 0,
    isInternalLink: true
  };
</script>

<script lang="ts">
  let updatingSettings = false;

  function triggerSettingsChanged() {
    $userSettings.pendingSettingsUpdate = true;
  }

  function saveSettings() {
    updatingSettings = true;
    // Working on the below first. Updates need to be able to happen on the
    // backend though.
    // APIService.callDashboardAPI({})
  }
</script>

<svelte:head>
  <title>{settingsPageInfo.shortTitle}</title>
  <meta name="description" content={settingsPageInfo.description} />
</svelte:head>

<PageTitle title={settingsPageInfo.shortTitle} subtitle={settingsPageInfo.description} />

<Paper>
  <Content>
    <div class="content">
      {#if $userSettings.config}
        <FormField>
          <Checkbox
            bind:checked={$userSettings.config.enableDevMode}
            touch
            on:click={triggerSettingsChanged}
          />
          <span slot="label">
            Enable dev mode
            <span class="mdc-theme--text-hint-on-background">
              Enables some development features on the site.
            </span>
          </span>
        </FormField>
        <Button disabled={!$userSettings.pendingSettingsUpdate} on:click={saveSettings}>
          {#if updatingSettings}
            <CircularProgress />
          {:else}
            Save Settings
          {/if}
        </Button>
      {/if}
    </div>
  </Content>
</Paper>

<style>
  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
</style>
