<script lang="ts">
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
  import IconButton from '@smui/icon-button';
  import { password } from '../stores/password';
  import NavDrawer from './NavDrawer.svelte';

  let navDrawerOpen = false;

  function handleLogOut() {
    password.set('');
  }
</script>

<TopAppBar variant="fixed" prominent={false} dense={true} color="primary">
  <Row>
    <Section>
      <IconButton
        class="material-icons"
        on:click={() => {
          navDrawerOpen = true;
        }}>menu</IconButton
      >
      <Title>Personal Dashboard</Title>
    </Section>
    <Section align="end" toolbar>
      <IconButton class="material-icons" aria-label="Log Out" on:click={handleLogOut}>
        logout
      </IconButton>
    </Section>
  </Row>
</TopAppBar>
<NavDrawer bind:open={navDrawerOpen} />
