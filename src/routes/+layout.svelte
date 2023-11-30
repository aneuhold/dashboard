<script lang="ts">
  import { password } from '../stores/password';
  import type { Unsubscriber } from 'svelte/store';
  import { onDestroy } from 'svelte';
  import InputBox from '../components/InputBox.svelte';
  import NavBar from '../components/NavBar.svelte';
  import PasswordHandler from '../util/PasswordHandler';
  import NavDrawer from '../components/NavDrawer.svelte';

  let passwordIsCorrect = false;
  let typedPassword = '';
  let navBar: NavBar;

  const unsubscribers: Array<Unsubscriber> = [];
  unsubscribers.push(
    password.subscribe((updatedPassword) => {
      PasswordHandler.verifyPassword(updatedPassword).then((result) => {
        passwordIsCorrect = result;
      });
    })
  );

  function handleSubmit() {
    password.set(typedPassword);
  }

  onDestroy(() => {
    unsubscribers.forEach((unsubscriber) => {
      unsubscriber();
    });
  });
</script>

<div class="app">
  {#if passwordIsCorrect}
    <main>
      <NavBar bind:this={navBar}>
        <div class="content">
          <slot />
        </div>
      </NavBar>
    </main>
  {:else}
    <InputBox
      label="Password"
      bind:inputValue={typedPassword}
      on:submit={handleSubmit}
      validationMessage="Invalid password"
      inputType="password"
    />
  {/if}
</div>

<style>
  .content {
    padding: 1rem;
  }
</style>
