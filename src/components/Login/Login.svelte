<script lang="ts">
  import {
    type APIResponse,
    APIService,
    type AuthValidateUserOutput
  } from '@aneuhold/core-ts-api-lib';
  import { ProjectName } from '@aneuhold/core-ts-db-lib';
  import Button, { Label } from '@smui/button';
  import CircularProgress from '@smui/circular-progress';
  import { onMount } from 'svelte';
  import InputBox from '$components/presentational/InputBox/InputBox.svelte';
  import googleGISService from '$services/GoogleGIS.service';
  import { dashboardConfig } from '$stores/local/dashboardConfig';
  import { password } from '$stores/local/password';
  import { LoginState, loginState } from '$stores/session/loginState';
  import { sessionExpired } from '$stores/session/sessionExpired';
  import DashboardAPIService from '$util/api/DashboardAPI.service';
  import LocalData from '$util/LocalData/LocalData';
  import { createLogger } from '$util/logging/logger';

  const log = createLogger('Login.svelte');

  let typedUserName = $state(LocalData.username);
  let typedPassword = $state(LocalData.password);
  let processingCredentials = $derived($loginState === LoginState.ProcessingCredentials);
  let invalidCredentials = $state(false);
  let googleButtonRef: HTMLDivElement | undefined = $state();

  onMount(async () => {
    if (googleButtonRef) {
      await googleGISService.renderButton(googleButtonRef, (response) => {
        void handleGoogleCallback(response);
      });
    }
  });

  async function handleGoogleCallback(response: google.accounts.id.CredentialResponse) {
    $loginState = LoginState.ProcessingCredentials;
    const result = await APIService.validateUser({
      googleCredentialToken: response.credential,
      project: ProjectName.Dashboard
    });
    handleLoginResult(result);
  }

  function handleSubmit(event: MouseEvent) {
    // Prevent the page from refreshing
    event.preventDefault();

    $loginState = LoginState.ProcessingCredentials;
    LocalData.username = typedUserName;
    password.set(typedPassword);
    APIService.validateUser({
      userName: typedUserName,
      password: typedPassword,
      project: ProjectName.Dashboard
    }).then(handleLoginResult);
  }

  function handleLoginResult(validationResponse: APIResponse<AuthValidateUserOutput>) {
    if (
      validationResponse.success &&
      validationResponse.data.userInfo?.user &&
      validationResponse.data.config?.dashboard
    ) {
      dashboardConfig.set(validationResponse.data.config.dashboard);
      invalidCredentials = false;
      const { accessToken, refreshTokenString } = validationResponse.data;

      // Store tokens for the auto-refresh mechanism
      if (accessToken) {
        APIService.setAccessToken(accessToken);
        LocalData.accessToken = accessToken;
      }
      if (refreshTokenString) {
        APIService.setRefreshTokenString(refreshTokenString);
        LocalData.refreshTokenString = refreshTokenString;
      }

      if (!$dashboardConfig?.projectDashboardFunctionUrl) {
        log.error('No dashboard function URL found in config');
        return;
      }
      DashboardAPIService.getInitialDataForLogin();
      $loginState = LoginState.LoggedIn;
    } else if (!validationResponse.success) {
      $loginState = LoginState.LoggedOut;
      invalidCredentials = true;
    } else {
      log.error('Unexpected response from validateUser', validationResponse);
    }
  }
</script>

<div class="container">
  <form class="credentialsInputArea">
    <InputBox
      label="Username"
      spellCheck={false}
      autocompleteLabel="username"
      bind:inputValue={typedUserName}
      inputType="text"
    />
    <InputBox
      label="Password"
      spellCheck={false}
      autocompleteLabel="current-password"
      bind:inputValue={typedPassword}
      inputType="password"
    />
    <div class="submitArea">
      <Button
        style="width: 100%;"
        variant="raised"
        class="material-icons dimmed-color"
        onclick={handleSubmit}
        disabled={processingCredentials}
        data-testid="login-submit-button"
      >
        {#if processingCredentials}
          <CircularProgress style="height: 32px; width: 32px;" indeterminate />
        {:else}
          <Label>Submit</Label>
        {/if}
      </Button>
      {#if invalidCredentials}
        <span class="errorMessage"> Invalid username or password </span>
      {:else if $sessionExpired}
        <span class="errorMessage"> Your session expired. Please log in again. </span>
      {/if}
    </div>
  </form>
  <div class="separatorArea">
    <hr class="separator" />
    <span class="separatorText">or</span>
    <hr class="separator" />
  </div>
  <div class="googleButtonArea">
    <div bind:this={googleButtonRef}></div>
  </div>
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
  .separatorArea {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    max-width: 250px;
    margin-top: 16px;
  }
  .separator {
    flex: 1;
    border: none;
    border-top: 1px solid var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.38));
  }
  .separatorText {
    color: var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.38));
    font-size: 0.875rem;
  }
  .googleButtonArea {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }
</style>
