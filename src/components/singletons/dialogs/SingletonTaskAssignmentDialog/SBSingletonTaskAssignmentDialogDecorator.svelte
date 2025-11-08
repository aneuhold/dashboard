<script lang="ts">
  import SingletonTaskAssignmentDialog from './SingletonTaskAssignmentDialog.svelte';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

{@render children?.()}
<SingletonTaskAssignmentDialog />
