<!--
  @component
  
  A page for settings of the dashboard for the current user.
-->
<script lang="ts">
  import Button from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import CircularProgress from '@smui/circular-progress';
  import FormField from '@smui/form-field';
  import Paper, { Content } from '@smui/paper';
  import PageTitle from 'components/PageTitle.svelte';
  import DashboardAPIService from 'util/DashboardAPIService';
  import { userSettings } from '../../stores/userSettings';
  import { settingsPageInfo } from './pageInfo';
  let updatingSettings = false;

  function triggerSettingsChanged() {
    $userSettings.pendingSettingsUpdate = true;
  }

  function saveSettings() {
    updatingSettings = true;
    DashboardAPIService.updateSettings($userSettings.config).then(() => {
      updatingSettings = false;
    });
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
      <FormField>
        <Checkbox
          bind:checked={$userSettings.config.enableDevMode}
          touch
          on:click={triggerSettingsChanged}
        />
        <span slot="label">
          Enable dev mode
          <span class="mdc-theme--text-hint-on-background checkBoxText">
            Enables some development features on the site.
          </span>
        </span>
      </FormField>
      <Button disabled={!$userSettings.pendingSettingsUpdate} on:click={saveSettings}>
        {#if updatingSettings}
          <CircularProgress style="height: 32px; width: 32px;" indeterminate={true} />
        {:else}
          Save Settings
        {/if}
      </Button>
    </div>
  </Content>
</Paper>

<style>
  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .checkBoxText {
    margin-left: 8px;
  }
</style>
