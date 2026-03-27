<script module lang="ts">
  import { APIService } from '@aneuhold/core-ts-api-lib';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { spyOn } from 'storybook/test';
  import SBAdminUserListExample from './SB/SBAdminUserListExample.svelte';

  const { Story } = defineMeta({
    title: 'Stateful Components/Admin/UserList',
    component: SBAdminUserListExample
  });
</script>

<Story name="With Users" />

<Story
  name="Empty List"
  beforeEach={() => {
    spyOn(APIService, 'callAdminAPI').mockResolvedValue({
      success: true,
      errors: [],
      data: { users: [] }
    });
  }}
/>

<Story
  name="Loading Error"
  beforeEach={() => {
    spyOn(APIService, 'callAdminAPI').mockResolvedValue({
      success: false,
      errors: ['Connection failed'],
      data: {}
    });
  }}
/>
