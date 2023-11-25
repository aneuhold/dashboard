<script lang="ts">
  import { password } from '../stores/password';
  import type { Unsubscriber } from 'svelte/store';
  import { onDestroy } from 'svelte';
  import InputBox from '../components/InputBox.svelte';
  import NavBar from '../components/NavBar.svelte';

  let passwordIsCorrect = false;
  let typedPassword = '';

  const unsubscribers: Array<Unsubscriber> = [];
  unsubscribers.push(
    password.subscribe((updatedPassword) => {
      passwordIsCorrect = updatedPassword === 'test';
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
      <NavBar />
      <slot />
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
</style>
