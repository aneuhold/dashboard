<script lang="ts">
  export let title: string;
  export let subtitle: string | null = null;
</script>

<div class="title-container">
  <h4 class={subtitle ? 'no-margin-bottom' : ''}>{title}</h4>
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
    margin-bottom: 16px;
    & .no-margin-bottom {
      margin-bottom: 0px;
    }
  }
</style>
