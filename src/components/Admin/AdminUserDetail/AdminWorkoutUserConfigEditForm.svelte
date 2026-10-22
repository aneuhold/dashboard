<!--
  @component

  Edit form for a user's WorkoutUserConfig. Each WorkoutEntitlement can be
  granted, cleared, or synced from RevenueCat.
-->
<script lang="ts">
  import { type User, WorkoutEntitlement, type WorkoutUserConfig } from '@aneuhold/core-ts-db-lib';
  import Button, { Icon, Label } from '@smui/button';
  import Paper, { Content, Title } from '@smui/paper';
  import { confirmationDialog } from '$components/singletons/dialogs/SingletonConfirmationDialog/SingletonConfirmationDialog.svelte';
  import type { AdminUserDetailUpdate, AdminUserDetailUpdater } from './types';

  let {
    user,
    workoutUserConfig,
    onUpdate
  }: {
    user: User;
    workoutUserConfig: WorkoutUserConfig;
    onUpdate: AdminUserDetailUpdater;
  } = $props();

  let entitlementSaving = $state(false);

  /**
   * Applies an admin update to one of the user's entitlements.
   *
   * @param entitlement - The entitlement being updated, for the error message.
   * @param update - The admin update to apply.
   * @param successMessage - The snackbar message shown when the update succeeds.
   */
  async function updateEntitlement(
    entitlement: WorkoutEntitlement,
    update: AdminUserDetailUpdate,
    successMessage: string
  ) {
    entitlementSaving = true;
    await onUpdate(update, successMessage, `Failed to update the "${entitlement}" entitlement`);
    entitlementSaving = false;
  }

  /**
   * Sets an entitlement's expiry on the user's workout config.
   *
   * @param entitlement - The entitlement to set.
   * @param expiresAt - The new expiry. Null removes the entitlement.
   * @param successMessage - The snackbar message shown when the update succeeds.
   */
  async function setEntitlementExpiresAt(
    entitlement: WorkoutEntitlement,
    expiresAt: Date | null,
    successMessage: string
  ) {
    await updateEntitlement(
      entitlement,
      {
        workoutUserConfigs: [
          {
            ...workoutUserConfig,
            entitlements: {
              ...workoutUserConfig.entitlements,
              [entitlement]: { expiresAt }
            }
          }
        ]
      },
      successMessage
    );
  }

  function grantEntitlement(entitlement: WorkoutEntitlement) {
    setEntitlementExpiresAt(
      entitlement,
      new Date(3000, 0, 1),
      `Granted the "${entitlement}" entitlement`
    );
  }

  function clearEntitlement(entitlement: WorkoutEntitlement) {
    confirmationDialog.open({
      title: 'Clear Entitlement',
      message: `Are you sure you want to clear the "${entitlement}" entitlement for "${user.userName}"?`,
      confirmationButtonText: 'Clear',
      onConfirm: async () => {
        await setEntitlementExpiresAt(
          entitlement,
          null,
          `Cleared the "${entitlement}" entitlement`
        );
      }
    });
  }

  function syncEntitlement(entitlement: WorkoutEntitlement) {
    updateEntitlement(
      entitlement,
      {
        sync: {
          [user._id]: {
            workoutUserConfig: { entitlements: [entitlement] }
          }
        }
      },
      `Synced the "${entitlement}" entitlement from RevenueCat`
    );
  }
</script>

<Paper>
  <Title>Edit Workout User Config</Title>
  <Content>
    <div class="entitlement-list">
      <strong>Entitlements</strong>
      {#each Object.values(WorkoutEntitlement) as entitlement (entitlement)}
        <div>
          {entitlement}: {workoutUserConfig.entitlements[
            entitlement
          ]?.expiresAt?.toLocaleDateString() ?? 'Not held'}
          <div class="action-buttons">
            <Button
              variant="raised"
              onclick={() => grantEntitlement(entitlement)}
              disabled={entitlementSaving}
            >
              <Label>Grant</Label>
            </Button>
            <Button
              variant="outlined"
              onclick={() => clearEntitlement(entitlement)}
              disabled={entitlementSaving}
            >
              <Label>Clear</Label>
            </Button>
            <Button
              variant="outlined"
              onclick={() => syncEntitlement(entitlement)}
              disabled={entitlementSaving}
            >
              <Icon class="material-icons">sync</Icon>
              <Label>Sync from RevenueCat</Label>
            </Button>
          </div>
        </div>
      {/each}
    </div>
  </Content>
</Paper>

<style>
  .entitlement-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .action-buttons {
    display: flex;
    flex-direction: row;
    gap: 8px;
    flex-wrap: wrap;
  }
</style>
