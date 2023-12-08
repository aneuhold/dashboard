<!--
  @component
  
  A page for Architecture info.

  Implementation notes:
  - SVG icons: https://worldvectorlogo.com/
-->
<script lang="ts">
  import Paper, { Title, Subtitle, Content as PaperContent } from '@smui/paper';
  import ArchitectureItemCard from './ArchitectureItemCard.svelte';
  import { page } from '$app/stores';
  import type { ArchitectureContext } from '../../../util/ArchitectureInfo/architectureContextInfo';
  import ArchitectureInfo from '../../../util/ArchitectureInfo/ArchitectureInfo';
  import architectureContextInfo from '../../../util/ArchitectureInfo/architectureContextInfo';
  import { onDestroy } from 'svelte';
  import List, { Graphic, Item, Meta, Text } from '@smui/list';
  import { goto } from '$app/navigation';
  import IconButton from '@smui/icon-button';
  import ArchitectureSection from './ArchitectureSection.svelte';

  let archContext: ArchitectureContext | null = null;

  const unsub = page.subscribe((pageData) => {
    archContext = ArchitectureInfo.getContextFromSearchParams(pageData.url.searchParams);
  });

  onDestroy(() => {
    unsub();
  });
</script>

<svelte:head>
  <title>Architecture</title>
  <meta name="description" content="Architecture info" />
</svelte:head>

<div class="title-container">
  <h4 class="title">Architecture Info</h4>
  <span class="mdc-typography--subtitle1">Architecture for various project types</span>
</div>

{#if archContext === null}
  <Paper>
    <Title>Architecture Contexts</Title>
    <PaperContent>
      <p>
        Architecture contexts are different types of projects that you have built or are building.
      </p>
      <List>
        {#each Object.entries(architectureContextInfo) as [contextName, contextInfo]}
          <Item on:SMUI:action={() => goto(`?context=${contextName}`)}>
            <Text>{contextInfo.title}</Text>
          </Item>
        {/each}
      </List>
    </PaperContent>
  </Paper>
{/if}

{#if archContext !== null}
  <Paper variant="outlined">
    <Title>
      <div class="arch-context-title">
        {archContext.title}
        <IconButton
          class="material-icons"
          on:click={() => {
            goto('/dev/arch');
          }}
        >
          arrow_back
        </IconButton>
      </div>
    </Title>
    {#if archContext.description}
      <Subtitle>
        {archContext.description}
      </Subtitle>
    {/if}
    <PaperContent>
      {#if archContext.frontendComponents}
        <ArchitectureSection
          title="Frontend"
          subtitle="Architecture for the frontend part of the project"
          components={archContext.frontendComponents}
        />
      {/if}
      {#if archContext.frontendTestingComponents}
        <ArchitectureSection
          title="Frontend Testing"
          subtitle="Architecture for the frontend testing portion of the project"
          components={archContext.frontendTestingComponents}
        />
      {/if}
      {#if archContext.backendComponents}
        <ArchitectureSection
          title="Backend"
          subtitle="Architecture for the backend part of the project"
          components={archContext.backendComponents}
        />
      {/if}
      {#if archContext.backendTestingComponents}
        <ArchitectureSection
          title="Backend Testing"
          subtitle="Architecture for the backend testing portion of the project"
          components={archContext.backendTestingComponents}
        />
      {/if}
      {#if archContext.devOpsComponents}
        <ArchitectureSection
          title="DevOps"
          subtitle="Architecture for the DevOps part of the project"
          components={archContext.devOpsComponents}
        />
      {/if}
    </PaperContent>
  </Paper>
{/if}

<style>
  .title-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;
    & .title {
      margin-bottom: 0px;
    }
  }
  .arch-context-title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
</style>
