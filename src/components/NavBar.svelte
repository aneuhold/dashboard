<script lang="ts">
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
  import IconButton from '@smui/icon-button';
  import { password } from '../stores/password';

  function handleLogOut() {
    password.set('');
  }
</script>

<TopAppBar variant="static" prominent={false} dense={true} color="primary">
  <Row>
    <Section>
      <IconButton class="material-icons">menu</IconButton>
      <Title>Personal Dashboard</Title>
    </Section>
    <Section align="end" toolbar>
      <IconButton class="material-icons" aria-label="Log Out" on:click={handleLogOut}
        >logout</IconButton
      >
    </Section>
  </Row>
</TopAppBar>
