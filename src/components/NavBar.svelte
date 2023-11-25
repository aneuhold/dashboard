<script lang="ts">
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
  import IconButton from '@smui/icon-button';
</script>

<TopAppBar variant="static" prominent={true} dense={true} color="primary">
  <Row>
    <Section>
      <IconButton class="material-icons">menu</IconButton>
      <Title>Personal Dashboard</Title>
    </Section>
    <Section align="end" toolbar>
      <IconButton class="material-icons" aria-label="Log Out">log_out</IconButton>
    </Section>
  </Row>
</TopAppBar>
