<!--
  @component
  
  A page for settings of the dashboard for the current user.
-->
<script lang="ts">
  import Button from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import Chip, { Set, Text, TrailingAction } from '@smui/chips';
  import CircularProgress from '@smui/circular-progress';
  import FormField from '@smui/form-field';
  import Paper, { Content } from '@smui/paper';
  import PageTitle from 'components/PageTitle.svelte';
  import GlobalTagSettings from 'components/Tasks/TaskTags/GlobalTagSettings.svelte';
  import InputBox from 'components/presentational/InputBox.svelte';
  import { snackbar } from 'components/singletons/SingletonSnackbar.svelte';
  import DashboardAPIService from 'util/api/DashboardAPIService';
  import { userSettings } from '../../stores/userSettings';
  import { settingsPageInfo } from './pageInfo';

  let updatingSettings = false;
  let searchingForUser = false;
  let userNameSearchValue = '';
  $: collaboratorUserNames = Object.values($userSettings.collaborators).map(
    (userCto) => userCto.userName
  );

  function triggerSettingsChanged() {
    $userSettings.pendingSettingsUpdate = true;
  }

  function saveSettings() {
    updatingSettings = true;
    DashboardAPIService.updateSettings($userSettings.config).then(() => {
      updatingSettings = false;
      snackbar.success('Settings successfully saved ❤️');
    });
  }

  function handleSearchForUser() {
    if (userNameSearchValue === '') return;
    searchingForUser = true;
    DashboardAPIService.checkIfUsernameIsValid(userNameSearchValue).then((userCto) => {
      if (userCto) {
        userSettings.addCollaborator(userCto);
        snackbar.success(`User ${userCto.userName} added to collaborators ✨`);
      } else {
        snackbar.error('User not found');
      }
      searchingForUser = false;
    });
  }

  function handleCollaboratorRemoval(event: CustomEvent<{ chipId: string }>) {
    userSettings.removeCollaborator(event.detail.chipId);
  }
</script>

<svelte:head>
  <title>{settingsPageInfo.shortTitle}</title>
  <meta name="description" content={settingsPageInfo.description} />
</svelte:head>

<PageTitle title={settingsPageInfo.shortTitle} subtitle={settingsPageInfo.description} />

<div class="container">
  <Paper>
    <Content>
      <div class="content">
        <h6 class="sectionTitle mdc-typography--subtitle1">General Settings</h6>
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
        <hr class="sectionSeparator" />
        <h6 class="sectionTitle mdc-typography--subtitle1">Collaborators</h6>
        <div class="collaboratorsContainer">
          <Set
            chips={collaboratorUserNames}
            let:chip
            input
            on:SMUIChip:removal={handleCollaboratorRemoval}
          >
            <Chip {chip}>
              <Text>{chip}</Text>
              <TrailingAction icon$class="material-icons">cancel</TrailingAction>
            </Chip>
          </Set>

          <div class="userNameSearch">
            <div>
              <InputBox
                bind:inputValue={userNameSearchValue}
                disable={searchingForUser}
                spellCheck={false}
                helperText="Enter a username to search"
                label="Username"
                on:submit={handleSearchForUser}
              />
            </div>
            <Button
              variant="raised"
              disabled={searchingForUser || userNameSearchValue === ''}
              on:click={handleSearchForUser}
            >
              {#if searchingForUser}
                <CircularProgress style="height: 32px; width: 32px;" indeterminate={true} />
              {:else}
                Search for User
              {/if}
            </Button>
          </div>
        </div>
        <hr class="sectionSeparator" />
        <div class="globalTagSettingsContainer">
          <GlobalTagSettings />
        </div>
        <hr class="sectionSeparator" />
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
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .sectionTitle {
    margin-bottom: 0px;
    margin-top: 0px;
    margin-left: 8px;
  }
  .sectionSeparator {
    width: 100%;
    border-color: darkgray;
  }
  .collaboratorsContainer {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
  }
  .globalTagSettingsContainer {
    width: 100%;
  }
  .userNameSearch {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-left: 8px;
  }
  .container {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .checkBoxText {
    margin-left: 8px;
  }
</style>
