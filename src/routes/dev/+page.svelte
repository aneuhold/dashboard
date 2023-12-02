<!--
  @component
  
  A page for Development info.

  Implementation notes:
  - SVG icons: https://worldvectorlogo.com/
-->
<script lang="ts">
  import SvelteIcon from '$lib/svgs/SvelteIcon.svelte';
  import Paper, { Title, Subtitle, Content as PaperContent } from '@smui/paper';
  import ArchitectureItemCard from './ArchitectureItemCard.svelte';
  import TypeScriptIcon from '$lib/svgs/TypeScriptIcon.svelte';
  import ArchitectureGrouping from './ArchitectureGrouping.svelte';
  import HtmlIcon from '$lib/svgs/HTMLIcon.svelte';
  import CssIcon from '$lib/svgs/CSSIcon.svelte';
  import JavaScriptIcon from '$lib/svgs/JavaScriptIcon.svelte';
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
        >
          Things related to the backend in SvelteKit such as server-side rendering is not being
          used. This is because a separate backend would be required to be bundled with the
          frontend, which would make the project more complicated. Instead, the backend is contacted
          via HTTP requests to Digital Ocean functions.
        </ArchitectureItemCard>
        <ArchitectureItemCard
          title="Svelte"
          subtitle="The underlying frontend framework of choice"
          docsUrl="https://svelte.dev/docs/introduction"
          iconComponent={SvelteIcon}
        />
        <ArchitectureGrouping borderBottom>
          <ArchitectureItemCard
            title="HTML"
            docsUrl="https://developer.mozilla.org/en-US/docs/Web/HTML"
            iconComponent={HtmlIcon}
          />
          <ArchitectureItemCard
            title="CSS"
            subtitle="A CSS preprocessor is not currently being used, but if needed, SASS is used"
            docsUrl="https://developer.mozilla.org/en-US/docs/Web/CSS"
            iconComponent={CssIcon}
          />
          <ArchitectureGrouping borderTop={false} borderLeft>
            <ArchitectureItemCard
              title="TypeScript"
              subtitle="The superset of JavaScript"
              docsUrl="https://www.typescriptlang.org/docs/handbook/intro.html"
              iconComponent={TypeScriptIcon}
            />
            <ArchitectureItemCard
              title="JavaScript"
              docsUrl="https://developer.mozilla.org/en-US/docs/Web/JavaScript"
              iconComponent={JavaScriptIcon}
            />
          </ArchitectureGrouping>
        </ArchitectureGrouping>
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
