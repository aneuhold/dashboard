<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ReactivityTest from './ReactivityTest.svelte';

  const { Story } = defineMeta({
    title: 'Experimental/ReactivityTest',
    component: ReactivityTest
  });
</script>

<Story name="Default" />
