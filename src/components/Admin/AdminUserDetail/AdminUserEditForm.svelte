<!--
  @component

  Edit form for a user's own fields, with save and delete actions.
-->
<script lang="ts">
  import type { User } from '@aneuhold/core-ts-db-lib';
  import Button, { Icon, Label } from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import CircularProgress from '@smui/circular-progress';
  import FormField from '@smui/form-field';
  import Paper, { Content, Title } from '@smui/paper';
  import { goto } from '$app/navigation';
  import InputBox from '$components/presentational/InputBox/InputBox.svelte';
  import { confirmationDialog } from '$components/singletons/dialogs/SingletonConfirmationDialog/SingletonConfirmationDialog.svelte';
  import { snackbar } from '$components/singletons/SingletonSnackbar.svelte';
  import AdminAPIService from '$util/api/AdminAPI.service';
  import type { AdminUserDetailUpdater } from './types';

  let {
    user,
    backUrl,
    onUpdate
  }: {
    user: User;
    backUrl: string;
    onUpdate: AdminUserDetailUpdater;
  } = $props();

  let saving = $state(false);

  // Editable fields, reset whenever the saved user changes
  let editUserName = $derived(user.userName);
  let editEmail = $derived(user.email ?? '');
  let editDashboardAccess = $derived(user.projectAccess.dashboard);
  let editWorkoutAccess = $derived(user.projectAccess.workout);
  let editIsSuperAdmin = $derived(user.auth.isSuperAdmin ?? false);

  let hasChanges = $derived(
    editUserName !== user.userName ||
      editEmail !== (user.email ?? '') ||
      editDashboardAccess !== user.projectAccess.dashboard ||
      editWorkoutAccess !== user.projectAccess.workout ||
      editIsSuperAdmin !== (user.auth.isSuperAdmin ?? false)
  );

  async function saveUser() {
    saving = true;
    await onUpdate(
      {
        users: [
          {
            ...user,
            userName: editUserName,
            email: editEmail || undefined,
            projectAccess: {
              dashboard: editDashboardAccess,
              workout: editWorkoutAccess
            },
            auth: {
              ...user.auth,
              isSuperAdmin: editIsSuperAdmin
            }
          }
        ]
      },
      'User saved',
      'Failed to save user'
    );
    saving = false;
  }

  function deleteUser() {
    const { userName, _id: deleteId } = user;
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
</script>

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

<style>
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
</style>
