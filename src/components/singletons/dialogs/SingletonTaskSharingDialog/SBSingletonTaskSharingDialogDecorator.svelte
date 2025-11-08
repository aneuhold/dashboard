<script lang="ts">
  import SingletonTaskSharingDialog from './SingletonTaskSharingDialog.svelte';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

{@render children?.()}
<SingletonTaskSharingDialog />
