<script lang="ts">
  import { goto } from '$app/navigation';
  import GitHubIcon from '$lib/svgs/GitHubIcon.svelte';
  import IconButton, { Icon } from '@smui/icon-button';
  import TopAppBar, { AutoAdjust, Row, Section, Title } from '@smui/top-app-bar';
  import { apiKey } from '../stores/apiKey';
  import { LoginState, loginState } from '../stores/loginState';
  import { navDrawerOpen } from '../stores/visual/navDrawerOpen';
  import NavDrawer from './NavDrawer.svelte';

  let topAppBar: TopAppBar;

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
        <Icon><svelte:component this={GitHubIcon} size={24} /></Icon>
      </IconButton>
      <IconButton
        class="material-icons"
        aria-label="Wiki"
        on:click={() => {
          window.open(
            'https://tiddlydrive.github.io/?state=%7B%22ids%22:%5B%2210CGz4YBnosNFYLJXXpR9GfaMK5j7WLe_%22%5D,%22action%22:%22open%22,%22userId%22:%22112679225576170416987%22,%22resourceKeys%22:%7B%7D%7D',
            '_blank'
          );
        }}
      >
        language
      </IconButton>
      <IconButton class="material-icons" aria-label="Log Out" on:click={handleLogOut}>
        logout
      </IconButton>
    </Section>
  </Row>
</TopAppBar>

<AutoAdjust {topAppBar}>
  <NavDrawer />
  <slot />
</AutoAdjust>

<style>
  .dashboard-title {
    cursor: pointer;
  }
</style>
