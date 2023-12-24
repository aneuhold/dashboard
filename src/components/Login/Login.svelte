<script lang="ts">
  import {
    APIService,
    type AuthValidateUserOutput,
    type ProjectDashboardOutput
  } from '@aneuhold/core-ts-api-lib';
  import CircularProgress from '@smui/circular-progress';
  import IconButton from '@smui/icon-button';
  import InputBox from 'components/InputBox.svelte';
  import LocalData from 'util/LocalData';
  import { apiKey } from '../../stores/apiKey';
  import { dashboardConfig } from '../../stores/dashboardConfig';
  import { LoginState, loginState } from '../../stores/loginState';
  import { password } from '../../stores/password';
  import { translations } from '../../stores/translations';

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

  function handleLoginResult(validationResponse: AuthValidateUserOutput) {
    if (
      validationResponse.success &&
      validationResponse.userInfo?.apiKey &&
      validationResponse.config?.dashboard
    ) {
      dashboardConfig.set(validationResponse.config.dashboard);
      invalidCredentials = false;
      const apiKeyValue = validationResponse.userInfo.apiKey.key;
      if (!$dashboardConfig?.projectDashboardFunctionUrl) {
        console.error('No dashboard function URL found in config');
        return;
      }
      APIService.setDashboardAPIUrl($dashboardConfig.projectDashboardFunctionUrl);
      APIService.callDashboardAPI({
        apiKey: apiKeyValue,
        options: {
          get: {
            translations: true,
            userConfig: true
          }
        }
      }).then((backendResponse) => {
        handleIntialBackendCallResult(backendResponse, apiKeyValue);
      });
    } else {
      invalidCredentials = true;
      processingCredentials = false;
    }
  }

  function handleIntialBackendCallResult(
    backendResponse: ProjectDashboardOutput,
    apiKeyValue: string
  ) {
    if (backendResponse.success && backendResponse.data?.translations) {
      const translationsContent = backendResponse.data.translations;
      translations.set(translationsContent);
      apiKey.set(apiKeyValue);
    } else {
      console.error('Error getting initial backend data, but got past login', backendResponse);
    }
    processingCredentials = false;
    loginState.set(LoginState.LoggedIn);
  }
</script>

<form class="credentialsInputArea">
  <InputBox
    label="Username"
    bind:inputValue={typedUserName}
    validationMessage="Invalid username"
    inputType="text"
  />
  <InputBox
    label="Password"
    bind:inputValue={typedPassword}
    validationMessage="Invalid password"
    inputType="password"
  />
  {#if processingCredentials}
    <CircularProgress style="height: 32px; width: 32px;" indeterminate />
  {:else}
    <IconButton class="material-icons dimmed-color" on:click={() => handleSubmit()}>
      send
    </IconButton>
  {/if}
  {#if invalidCredentials}
    <span class="errorMessage"> Invalid username or password </span>
  {/if}
</form>

<style>
  .credentialsInputArea {
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .errorMessage {
    color: var(--mdc-theme-error);
  }
</style>
