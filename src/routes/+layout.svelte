<script lang="ts">
  import { APIService } from '@aneuhold/core-ts-api-lib';
  import CircularProgress from '@smui/circular-progress';
  import IconButton from '@smui/icon-button';
  import { onDestroy } from 'svelte';
  import type { Unsubscriber } from 'svelte/store';
  import LocalData from 'util/LocalData';
  import InputBox from '../components/InputBox.svelte';
  import NavBar from '../components/NavBar.svelte';
  import '../globalStyles/global.css';
  import { apiKey } from '../stores/apiKey';
  import { password } from '../stores/password';

  let typedUserName = '';
  let typedPassword = '';
  let navBar: NavBar;
  let processingCredentials = false;
  let apiKeyExists = false;
  let invalidCredentials = false;

  const unsubscribers: Array<Unsubscriber> = [];
  unsubscribers.push(
    apiKey.subscribe((updatedApiKey) => {
      if (updatedApiKey) {
        apiKeyExists = true;
      } else {
        apiKeyExists = false;
      }
    })
  );

  LocalData.initialize().then(() => {
    typedUserName = LocalData.username;
    typedPassword = LocalData.password;
  });

  function handleSubmit() {
    processingCredentials = true;
    LocalData.username = typedUserName;
    password.set(typedPassword);
    APIService.validateUser({
      userName: typedUserName,
      password: typedPassword
    }).then((result) => {
      if (result.success && result.userInfo?.apiKey) {
        apiKey.set(result.userInfo.apiKey.key);
        invalidCredentials = false;
      } else {
        invalidCredentials = true;
      }
      processingCredentials = false;
    });
  }

  onDestroy(() => {
    unsubscribers.forEach((unsubscriber) => {
      unsubscriber();
    });
  });
</script>

<div class="app">
  {#if apiKeyExists}
    <main>
      <NavBar bind:this={navBar}>
        <div class="content">
          <slot />
        </div>
      </NavBar>
    </main>
  {:else}
    <div class="credentialsInputArea">
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
    </div>
  {/if}
</div>

<style>
  .content {
    padding: 1rem;
  }
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
