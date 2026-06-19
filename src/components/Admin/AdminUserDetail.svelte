<!--
  @component

  Detail/edit view for a single user. Fetches user detail on mount and
  provides editing and deletion.
-->
<script lang="ts">
  import type { AdminOutputUserDetail } from '@aneuhold/core-ts-api-lib';
  import type { User } from '@aneuhold/core-ts-db-lib';
  import Button, { Icon, Label } from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import CircularProgress from '@smui/circular-progress';
  import FormField from '@smui/form-field';
  import Paper, { Content, Title } from '@smui/paper';
  import type { UUID } from 'crypto';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import PageTitle from '$components/PageTitle.svelte';
  import InputBox from '$components/presentational/InputBox/InputBox.svelte';
  import { confirmationDialog } from '$components/singletons/dialogs/SingletonConfirmationDialog/SingletonConfirmationDialog.svelte';
  import { snackbar } from '$components/singletons/SingletonSnackbar.svelte';
  import AdminAPIService from '$util/api/AdminAPI.service';
  import AdminUserConfigInfo from './AdminUserConfigInfo.svelte';

  let {
    userId,
    backUrl
  }: {
    userId: UUID;
    backUrl: string;
  } = $props();

  let userDetail = $state<AdminOutputUserDetail | undefined>(undefined);
  let loading = $state(false);
  let saving = $state(false);
  let loadError = $state(false);

  // Editable fields
  let editUserName = $state('');
  let editEmail = $state('');
  let editDashboardAccess = $state(false);
  let editWorkoutAccess = $state(false);
  let editIsSuperAdmin = $state(false);

  let hasChanges = $derived.by(() => {
    if (!userDetail) return false;
    const { user } = userDetail;
    return (
      editUserName !== user.userName ||
      editEmail !== (user.email ?? '') ||
      editDashboardAccess !== user.projectAccess.dashboard ||
      editWorkoutAccess !== user.projectAccess.workout ||
      editIsSuperAdmin !== (user.auth.isSuperAdmin ?? false)
    );
  });

  /**
   * Populates the edit fields from a user object.
   *
   * @param user - The user to populate from.
   */
  function populateEditFields(user: User) {
    editUserName = user.userName;
    editEmail = user.email ?? '';
    editDashboardAccess = user.projectAccess.dashboard;
    editWorkoutAccess = user.projectAccess.workout;
    editIsSuperAdmin = user.auth.isSuperAdmin ?? false;
  }

  async function loadDetail() {
    loading = true;
    loadError = false;
    try {
      const result = await AdminAPIService.query({ get: { userDetail: userId } });
      if (result?.userDetail) {
        userDetail = result.userDetail;
        populateEditFields(result.userDetail.user);
      } else {
        loadError = true;
      }
    } catch {
      loadError = true;
    } finally {
      loading = false;
    }
  }

  async function saveUser() {
    if (!userDetail) return;
    saving = true;
    try {
      const result = await AdminAPIService.query({
        update: {
          users: [
            {
              ...userDetail.user,
              userName: editUserName,
              email: editEmail || undefined,
              projectAccess: {
                dashboard: editDashboardAccess,
                workout: editWorkoutAccess
              },
              auth: {
                ...userDetail.user.auth,
                isSuperAdmin: editIsSuperAdmin
              }
            }
          ]
        },
        get: { userDetail: userDetail.user._id }
      });
      if (result?.userDetail) {
        userDetail = result.userDetail;
        populateEditFields(result.userDetail.user);
        snackbar.success('User saved');
      } else {
        snackbar.error('Failed to save user');
      }
    } catch {
      snackbar.error('Failed to save user');
    } finally {
      saving = false;
    }
  }

  function deleteUser() {
    if (!userDetail) return;
    const userName = userDetail.user.userName;
    const deleteId = userDetail.user._id;
    confirmationDialog.open({
      title: 'Delete User',
      message: `Are you sure you want to delete user "${userName}"? This cannot be undone.`,
      confirmationButtonText: 'Delete',
      onConfirm: async () => {
        const result = await AdminAPIService.query({
          delete: { userIds: [deleteId] }
        });
        if (result) {
          snackbar.success(`User "${userName}" deleted`);
          goto(backUrl);
        }
      }
    });
  }

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
    <Paper>
      <Title>Edit User</Title>
      <Content>
        <div class="form-fields">
          <InputBox label="Username" bind:inputValue={editUserName} />
          <InputBox label="Email" bind:inputValue={editEmail} />
          <FormField>
            <Checkbox bind:checked={editDashboardAccess} touch />
            {#snippet label()}
              <span>Dashboard access</span>
            {/snippet}
          </FormField>
          <FormField>
            <Checkbox bind:checked={editWorkoutAccess} touch />
            {#snippet label()}
              <span>Workout access</span>
            {/snippet}
          </FormField>
          <FormField>
            <Checkbox bind:checked={editIsSuperAdmin} touch />
            {#snippet label()}
              <span>Super admin</span>
            {/snippet}
          </FormField>
        </div>
        <div class="action-buttons">
          <Button variant="raised" onclick={saveUser} disabled={saving || !hasChanges}>
            {#if saving}
              <CircularProgress style="height: 24px; width: 24px;" indeterminate />
            {:else}
              <Label>Save</Label>
            {/if}
          </Button>
          <Button variant="outlined" onclick={deleteUser}>
            <Icon class="material-icons">delete</Icon>
            <Label>Delete</Label>
          </Button>
        </div>
      </Content>
    </Paper>

    <AdminUserConfigInfo {userDetail} />
  </div>
{/if}

<style>
  .detail-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .form-fields {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }
  .action-buttons {
    display: flex;
    flex-direction: row;
    gap: 8px;
    flex-wrap: wrap;
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
