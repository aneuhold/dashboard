<script lang="ts">
  import TopAppBar, { AutoAdjust, Row, Section, Title } from '@smui/top-app-bar';
  import IconButton from '@smui/icon-button';
  import { password } from '../stores/password';
  import { goto } from '$app/navigation';
  import { navDrawerOpen } from '../stores/navDrawerOpen';
  import NavDrawer from './NavDrawer.svelte';

  let topAppBar: TopAppBar;

  function handleLogOut() {
    password.set('');
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
