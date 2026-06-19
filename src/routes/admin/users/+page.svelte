<!--
  @component

  Admin users page. Shows a list of all users, or a user detail view
  when a userId query parameter is present.
-->
<script lang="ts">
  import { DocumentService } from '@aneuhold/core-ts-db-lib';
  import { page } from '$app/stores';
  import AdminUserDetail from '$components/Admin/AdminUserDetail.svelte';
  import AdminUserList from '$components/Admin/AdminUserList.svelte';
  import { adminUsersPageInfo } from './pageInfo';

  let userId = $derived.by(() => {
    const userIdParam = $page.url.searchParams.get('userId');
    return userIdParam ? DocumentService.toUUID(userIdParam) : undefined;
  });
</script>

<svelte:head>
  <title>{adminUsersPageInfo.shortTitle}</title>
  <meta name="description" content={adminUsersPageInfo.description} />
</svelte:head>

{#if userId}
  <AdminUserDetail {userId} backUrl={adminUsersPageInfo.url} />
{:else}
  <AdminUserList
    title={adminUsersPageInfo.shortTitle}
    subtitle={adminUsersPageInfo.description}
    baseUrl={adminUsersPageInfo.url}
  />
{/if}
