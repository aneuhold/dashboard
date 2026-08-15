<script lang="ts">
  import { APIService } from '@aneuhold/core-ts-api-lib';
  import IconButton, { Icon } from '@smui/icon-button';
  import TopAppBar, { AutoAdjust, Row, Section, Title } from '@smui/top-app-bar';
  import type { Snippet } from 'svelte';
  import { goto } from '$app/navigation';
  import SyncIndicator from '$components/presentational/SyncIndicator.svelte';
  import GitHubIcon from '$lib/svgs/GitHubIcon.svelte';
  import googleGISService from '$services/GoogleGIS.service';
  import { LoginState, loginState } from '$stores/session/loginState';
  import { navDrawerOpen } from '$stores/session/navDrawerOpen';
  import LocalData from '$util/LocalData/LocalData';
  import NavDrawer from './NavDrawer.svelte';

  let {
    children
  }: {
    children?: Snippet;
  } = $props();

  let topAppBar: TopAppBar | null = $state(null);

  async function handleLogOut() {
    // Delete refresh token server-side
    await APIService.logout();

    // Clear local state
    LocalData.accessToken = '';
    LocalData.refreshTokenString = '';
    loginState.set(LoginState.LoggedOut);

    // Prevent Google auto-sign-in on next visit
    googleGISService.disableAutoSelect();
  }
</script>

<TopAppBar bind:this={topAppBar} variant="fixed" prominent={false} dense={true} color="primary">
  <Row>
    <Section>
      <IconButton
        onclick={() => {
          $navDrawerOpen = true;
        }}
      >
        <Icon class="material-icons">menu</Icon>
      </IconButton>
      <div class="dashboard-title">
        <Title
          onclick={() => {
            goto('/');
          }}
        >
          Personal Dashboard
        </Title>
      </div>
    </Section>
    <Section align="end" toolbar>
      <div class="sync-icon">
        <SyncIndicator />
      </div>

      <IconButton
        aria-label="GitHub"
        onclick={() => {
          window.open('https://github.com/aneuhold?tab=repositories', '_blank');
        }}
      >
        <Icon><GitHubIcon size={24} /></Icon>
      </IconButton>
      <IconButton aria-label="Log Out" onclick={handleLogOut}>
        <Icon class="material-icons">logout</Icon>
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

  .sync-icon {
    display: flex;
    align-items: center;
    padding-inline: 0.8rem;
  }
</style>
