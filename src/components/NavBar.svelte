<script lang="ts">
  import { goto } from '$app/navigation';
  import GitHubIcon from '$lib/svgs/GitHubIcon.svelte';
  import IconButton, { Icon } from '@smui/icon-button';
  import TopAppBar, { AutoAdjust, Row, Section, Title } from '@smui/top-app-bar';
  import { apiKey } from '../stores/apiKey';
  import { LoginState, loginState } from '../stores/loginState';
  import { navDrawerOpen } from '../stores/visual/navDrawerOpen';
  import NavDrawer from './NavDrawer.svelte';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  let topAppBar: TopAppBar = $state();

  function handleLogOut() {
    apiKey.set(null);
    loginState.set(LoginState.LoggedOut);
  }
</script>

<TopAppBar bind:this={topAppBar} variant="fixed" prominent={false} dense={true} color="primary">
  <Row>
    <Section>
      <IconButton
        class="material-icons"
        on:click={() => {
          $navDrawerOpen = true;
        }}>menu</IconButton
      >
      <div class="dashboard-title">
        <Title
          on:click={() => {
            goto('/');
          }}
        >
          Personal Dashboard
        </Title>
      </div>
    </Section>
    <Section align="end" toolbar>
      <IconButton
        class="material-icons"
        aria-label="GitHub"
        on:click={() => {
          window.open('https://github.com/aneuhold?tab=repositories', '_blank');
        }}
      >
        <Icon><GitHubIcon size={24} /></Icon>
      </IconButton>
      <IconButton class="material-icons" aria-label="Log Out" on:click={handleLogOut}>
        logout
      </IconButton>
    </Section>
  </Row>
</TopAppBar>

<AutoAdjust {topAppBar}>
  <NavDrawer />
  {@render children?.()}
</AutoAdjust>

<style>
  .dashboard-title {
    cursor: pointer;
  }
</style>
