<script lang="ts">
  import BreadCrumb from './BreadCrumb.svelte';

  export let title: string;
  export let subtitle: string | null = null;
</script>

<BreadCrumb />
<div class="title-container">
  <h4 class="title">{title}</h4>
  {#if subtitle}
    <div class="mdc-typography--caption mdc-theme--text-hint-on-background">{subtitle}</div>
  {/if}
</div>

<style>
  .title-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 40px;

    & .title {
      margin-top: 8px;
      margin-bottom: 0px;
    }
  }
</style>
