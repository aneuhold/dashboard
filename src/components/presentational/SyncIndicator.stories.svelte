<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import apiActivityService from '$services/ApiActivity.service.svelte';
  import SBSyncIndicatorExample from './SBSyncIndicatorExample.svelte';

  const { Story } = defineMeta({
    title: 'Presentational Components/SyncIndicator',
    component: SBSyncIndicatorExample,
    beforeEach: () => {
      apiActivityService.setIdle();
    }
  });
</script>

<Story name="Default" />
