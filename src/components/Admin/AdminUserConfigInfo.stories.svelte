<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MockData from '$testUtils/MockData';
  import AdminUserConfigInfo from './AdminUserConfigInfo.svelte';

  const { Story } = defineMeta({
    title: 'Stateful Components/Admin/UserConfigInfo',
    component: AdminUserConfigInfo
  });

  const fullDetail = MockData.adminAPIServiceMock.createUserDetail();
</script>

<Story name="With All Sections" args={{ userDetail: fullDetail }} />

<Story
  name="Without User Config"
  args={{
    userDetail: {
      ...fullDetail,
      userConfig: undefined
    }
  }}
/>

<Story
  name="Without Document Counts"
  args={{
    userDetail: {
      ...fullDetail,
      documentCounts: undefined
    }
  }}
/>
