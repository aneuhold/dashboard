<script module lang="ts">
  import { APIService } from '@aneuhold/core-ts-api-lib';
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { spyOn } from 'storybook/test';
  import MockData from '$testUtils/MockData';
  import sbAdminUserDetailMetaBase from './SB/AdminUserDetailStoriesBase';

  const adminMock = MockData.adminAPIServiceMock;

  const { Story } = defineMeta({
    ...sbAdminUserDetailMetaBase,
    title: 'Stateful Components/Admin/UserDetail',
    beforeEach: () => {
      const spy = spyOn(APIService, 'callAdminAPI').mockResolvedValue({
        success: true,
        errors: [],
        data: adminMock.createUserDetailResponse(),
        statusCode: 200
      });
      return () => spy.mockRestore();
    }
  });
</script>

<Story name="Default" />

<Story
  name="Without Dashboard Config"
  beforeEach={() => {
    const detail = adminMock.createUserDetail();
    spyOn(APIService, 'callAdminAPI').mockResolvedValue({
      success: true,
      errors: [],
      data: {
        userDetail: {
          ...detail,
          userConfig: undefined
        }
      },
      statusCode: 200
    });
  }}
/>

<Story
  name="Without Workout Config"
  beforeEach={() => {
    const detail = adminMock.createUserDetail();
    spyOn(APIService, 'callAdminAPI').mockResolvedValue({
      success: true,
      errors: [],
      data: {
        userDetail: {
          ...detail,
          workoutUserConfig: undefined
        }
      },
      statusCode: 200
    });
  }}
/>
