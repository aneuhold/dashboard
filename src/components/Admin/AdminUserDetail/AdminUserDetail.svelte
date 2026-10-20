<!--
  @component

  Detail/edit view for a single user. Fetches user detail on mount and shows
  the edit forms for the user and their WorkoutUserConfig, plus read-only
  config info.
-->
<script lang="ts">
  import type { AdminOutputUserDetail } from '@aneuhold/core-ts-api-lib';
  import CircularProgress from '@smui/circular-progress';
  import type { UUID } from 'crypto';
  import { onMount } from 'svelte';
  import PageTitle from '$components/PageTitle.svelte';
  import { snackbar } from '$components/singletons/SingletonSnackbar.svelte';
  import AdminAPIService from '$util/api/AdminAPI.service';
  import AdminUserConfigInfo from './AdminUserConfigInfo.svelte';
  import AdminUserEditForm from './AdminUserEditForm.svelte';
  import AdminWorkoutUserConfigEditForm from './AdminWorkoutUserConfigEditForm.svelte';
  import type { AdminUserDetailUpdater } from './types';

  let {
    userId,
    backUrl
  }: {
    userId: UUID;
    backUrl: string;
  } = $props();

  let userDetail = $state<AdminOutputUserDetail | undefined>(undefined);
  let loading = $state(false);
  let loadError = $state(false);

  async function loadDetail() {
    loading = true;
    loadError = false;
    try {
      const result = await AdminAPIService.query({ get: { userDetail: userId } });
      if (result?.userDetail) {
        userDetail = result.userDetail;
      } else {
        loadError = true;
      }
    } catch {
      loadError = true;
    } finally {
      loading = false;
    }
  }

  const updateUserDetail: AdminUserDetailUpdater = async (update, successMessage, errorMessage) => {
    if (!userDetail) return;
    try {
      const result = await AdminAPIService.query({
        update,
        get: { userDetail: userDetail.user._id }
      });
      if (result?.userDetail) {
        userDetail = result.userDetail;
        snackbar.success(successMessage);
      } else {
        snackbar.error(errorMessage);
      }
    } catch {
      snackbar.error(errorMessage);
    }
  };

  onMount(() => {
    loadDetail();
  });
</script>

{#if loading}
  <div class="loading">
    <CircularProgress indeterminate />
  </div>
{:else if loadError}
  <div class="error-state">Failed to load user details. Please try again later.</div>
{:else if userDetail}
  <PageTitle title={userDetail.user.userName} subtitle="User Details" />

  <div class="detail-container">
    <AdminUserEditForm user={userDetail.user} {backUrl} onUpdate={updateUserDetail} />
    {#if userDetail.workoutUserConfig}
      <AdminWorkoutUserConfigEditForm
        user={userDetail.user}
        workoutUserConfig={userDetail.workoutUserConfig}
        onUpdate={updateUserDetail}
      />
    {/if}
    <AdminUserConfigInfo {userDetail} />
  </div>
{/if}

<style>
  .detail-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .loading {
    display: flex;
    justify-content: center;
    padding: 32px;
  }
  .error-state {
    text-align: center;
    padding: 32px;
    color: var(--error);
  }
</style>
