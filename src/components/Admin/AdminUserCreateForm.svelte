<!--
  @component

  Form for creating a new user via the admin API.
-->
<script lang="ts">
  import { UserSchema } from '@aneuhold/core-ts-db-lib';
  import Button, { Label } from '@smui/button';
  import Checkbox from '@smui/checkbox';
  import CircularProgress from '@smui/circular-progress';
  import FormField from '@smui/form-field';
  import Paper, { Content, Title } from '@smui/paper';
  import InputBox from '$components/presentational/InputBox/InputBox.svelte';
  import { snackbar } from '$components/singletons/SingletonSnackbar.svelte';
  import AdminAPIService from '$util/api/AdminAPIService';

  let {
    onCreated,
    onCancel
  }: {
    onCreated: () => void;
    onCancel: () => void;
  } = $props();

  let userName = $state('');
  let email = $state('');
  let password = $state('');
  let dashboardAccess = $state(false);
  let workoutAccess = $state(true);
  let creating = $state(false);

  async function handleCreate() {
    if (!userName) return;
    creating = true;
    const newUser = UserSchema.parse({
      userName,
      email: email || undefined,
      auth: { password: password || undefined },
      projectAccess: { dashboard: dashboardAccess, workout: workoutAccess }
    });
    const result = await AdminAPIService.query({
      insert: { users: [newUser] },
      get: { users: true }
    });
    if (result?.users) {
      snackbar.success(`User "${userName}" created`);
      onCreated();
    }
    creating = false;
  }
</script>

<Paper>
  <Title>Create User</Title>
  <Content>
    <div class="form-fields">
      <InputBox label="Username" bind:inputValue={userName} />
      <InputBox label="Email" bind:inputValue={email} />
      <InputBox label="Password" bind:inputValue={password} />
      <FormField>
        <Checkbox bind:checked={dashboardAccess} touch />
        {#snippet label()}
          <span>Dashboard access</span>
        {/snippet}
      </FormField>
      <FormField>
        <Checkbox bind:checked={workoutAccess} touch />
        {#snippet label()}
          <span>Workout access</span>
        {/snippet}
      </FormField>
    </div>
    <div class="action-buttons">
      <Button variant="raised" onclick={handleCreate} disabled={creating || !userName}>
        {#if creating}
          <CircularProgress style="height: 24px; width: 24px;" indeterminate />
        {:else}
          <Label>Create</Label>
        {/if}
      </Button>
      <Button variant="outlined" onclick={onCancel}>
        <Label>Cancel</Label>
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
