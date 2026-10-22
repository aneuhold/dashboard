<!--
  @component

  Storybook example wrapper for AdminUserDetail. Provides a mock userId
  and prevents actual navigation on delete.
-->
<script lang="ts">
  import type { UUID } from 'crypto';
  import MockData from '$testUtils/MockData';
  import AdminUserDetail from '../AdminUserDetail.svelte';

  let {
    userId = MockData.adminAPIServiceMock.getUser(0)._id,
    backUrl = '/admin/users'
  }: {
    userId?: UUID;
    backUrl?: string;
  } = $props();
</script>

<AdminUserDetail {userId} {backUrl} />
