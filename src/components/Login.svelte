<script lang="ts">
  import {
    APIService,
    type AuthValidateUserOutput,
    type DOFunctionCallOutput
  } from '@aneuhold/core-ts-api-lib';
  import Button, { Label } from '@smui/button';
  import CircularProgress from '@smui/circular-progress';
  import InputBox from 'components/InputBox.svelte';
  import LocalData from 'util/LocalData';
  import DashboardAPIService from 'util/api/DashboardAPIService';
  import { apiKey } from '../stores/apiKey';
  import { dashboardConfig } from '../stores/dashboardConfig';
  import { password } from '../stores/password';

  let typedUserName = LocalData.username;
  let typedPassword = LocalData.password;
  let processingCredentials = false;
  let invalidCredentials = false;

  function handleSubmit() {
    processingCredentials = true;
    LocalData.username = typedUserName;
    password.set(typedPassword);
    APIService.validateUser({
      userName: typedUserName,
      password: typedPassword
    }).then(handleLoginResult);
  }

  function handleLoginResult(validationResponse: DOFunctionCallOutput<AuthValidateUserOutput>) {
    if (
      validationResponse.success &&
      validationResponse.data.userInfo?.apiKey &&
      validationResponse.data.config?.dashboard
    ) {
      dashboardConfig.set(validationResponse.data.config.dashboard);
      invalidCredentials = false;
      const apiKeyValue = validationResponse.data.userInfo.apiKey.key;
      apiKey.set(apiKeyValue);
      if (!$dashboardConfig?.projectDashboardFunctionUrl) {
        console.error('No dashboard function URL found in config');
        return;
      }
      DashboardAPIService.getInitialData().then(() => {
        processingCredentials = false;
      });
    }
  }
</script>

<div class="container">
  <form class="credentialsInputArea">
    <InputBox
      label="Username"
      autocompleteLabel="username"
      bind:inputValue={typedUserName}
      inputType="text"
    />
    <InputBox
      label="Password"
      autocompleteLabel="password"
      bind:inputValue={typedPassword}
      inputType="password"
    />
    <div class="submitArea">
      <Button
        style="width: 100%;"
        variant="raised"
        class="material-icons dimmed-color"
        on:click={handleSubmit}
        disabled={processingCredentials}
      >
        {#if processingCredentials}
          <CircularProgress style="height: 32px; width: 32px;" indeterminate />
        {:else}
          <Label>Submit</Label>
        {/if}
      </Button>
      {#if invalidCredentials}
        <span class="errorMessage"> Invalid username or password </span>
      {/if}
    </div>
  </form>
</div>

<style>
  .container {
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 16px;
  }
  .credentialsInputArea {
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    gap: 16px;
    width: 100%;
    max-width: 250px;
  }
  .errorMessage {
    color: var(--mdc-theme-error);
  }
</style>
