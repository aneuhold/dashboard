<script lang="ts">
  import SvelteIcon from '$lib/svgs/SvelteIcon.svelte';
  import Paper, { Title, Subtitle, Content as PaperContent } from '@smui/paper';
  import ArchitectureItemCard from './ArchitectureItemCard.svelte';
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
  <Subtitle
    >The current chosen architecture for new projects. The order is from highest-level to
    lowest-level</Subtitle
  >
  <PaperContent>
    <Paper>
      <Title>Frontend</Title>
      <Subtitle>Architecture for the frontend part of projects</Subtitle>
      <PaperContent>
        <ArchitectureItemCard
          title="SvelteKit"
          subtitle="The framework over Svelte that provides routing and other things"
          docsUrl="https://kit.svelte.dev/docs/introduction"
          iconComponent={SvelteIcon}
        />
        <ArchitectureItemCard
          title="Svelte"
          subtitle="The underlying frontend framework of choice"
          docsUrl="https://svelte.dev/docs/introduction"
          iconComponent={SvelteIcon}
        />
      </PaperContent>
    </Paper>
  </PaperContent>
</Paper>

<style>
  .title {
    display: flex;
    justify-content: center;
  }
</style>
