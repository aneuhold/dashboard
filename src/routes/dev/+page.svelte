<!--
  @component
  
  A page for Development info.

  Implementation notes:
  - SVG icons: https://worldvectorlogo.com/
-->
<script lang="ts">
  import Paper, { Title, Content as PaperContent } from '@smui/paper';
</script>

<svelte:head>
  <title>Development</title>
  <meta name="description" content="Development info" />
</svelte:head>

<div class="title">
  <h4>Development Links and Info</h4>
</div>

<Paper variant="outlined">
  <Title>Architecture</Title>
  <PaperContent>
    <ul>
      <li><a href="/dev/arch">All Architecture Contexts</a></li>
    </ul>
  </PaperContent>
</Paper>

<style>
  .title {
    display: flex;
    justify-content: center;
  }
</style>
