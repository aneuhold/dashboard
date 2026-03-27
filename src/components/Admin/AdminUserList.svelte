<!--
  @component

  Displays a searchable list of all users with a create user toggle.
-->
<script lang="ts">
  import type { User } from '@aneuhold/core-ts-db-lib';
  import CircularProgress from '@smui/circular-progress';
  import IconButton from '@smui/icon-button';
  import List, { Graphic, Item, PrimaryText, SecondaryText, Text } from '@smui/list';
  import Paper, { Content } from '@smui/paper';
  import Textfield from '@smui/textfield';
  import type { UUID } from 'crypto';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import PageTitle from '$components/PageTitle.svelte';
  import AdminAPIService from '$util/api/AdminAPIService';
  import AdminUserCreateForm from './AdminUserCreateForm.svelte';

  let {
    title,
    subtitle = null,
    baseUrl
  }: {
    title: string;
    subtitle?: string | null;
    baseUrl: string;
  } = $props();

  let users = $state<User[]>([]);
  let loading = $state(false);
  let loadError = $state(false);
  let searchQuery = $state('');
  let showCreateForm = $state(false);

  let filteredUsers = $derived(
    searchQuery
      ? users.filter(
          (u) =>
            u.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : users
  );

  async function loadUsers() {
    loading = true;
    loadError = false;
    try {
      const result = await AdminAPIService.query({ get: { users: true } });
      if (result?.users) {
        users = result.users;
      } else {
        loadError = true;
      }
    } catch {
      loadError = true;
    } finally {
      loading = false;
    }
  }

  function goToUser(id: UUID) {
    goto(`${baseUrl}?userId=${id}`);
  }

  function handleUserCreated() {
    showCreateForm = false;
    loadUsers();
  }

  onMount(() => {
    loadUsers();
  });
</script>

<PageTitle {title} {subtitle} />

<div class="list-container">
  <div class="list-actions">
    <Textfield
      variant="outlined"
      bind:value={searchQuery}
      label="Search users"
      class="search-field"
    />
    <IconButton
      class="material-icons"
      onclick={() => (showCreateForm = !showCreateForm)}
      title="Create user"
    >
      person_add
    </IconButton>
  </div>

  {#if showCreateForm}
    <AdminUserCreateForm onCreated={handleUserCreated} onCancel={() => (showCreateForm = false)} />
  {/if}

  {#if loading}
    <div class="loading">
      <CircularProgress indeterminate />
    </div>
  {:else if loadError}
    <div class="error-state">Failed to load users. Please try again later.</div>
  {:else}
    <Paper>
      <Content>
        <List twoLine>
          {#each filteredUsers as user (user._id)}
            <Item onclick={() => goToUser(user._id)}>
              <Graphic class="material-icons">person</Graphic>
              <Text>
                <PrimaryText>{user.userName}</PrimaryText>
                <SecondaryText>{user.email ?? 'No email'}</SecondaryText>
              </Text>
            </Item>
          {/each}
        </List>
        {#if filteredUsers.length === 0}
          <div class="empty-state">No users found</div>
        {/if}
      </Content>
    </Paper>
  {/if}
</div>

<style>
  .list-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .list-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
  .loading {
    display: flex;
    justify-content: center;
    padding: 32px;
  }
  .empty-state {
    text-align: center;
    padding: 16px;
    color: var(--mdc-theme-text-hint-on-background);
  }
  .error-state {
    text-align: center;
    padding: 32px;
    color: var(--error);
  }
  :global(.search-field) {
    flex: 1;
  }
</style>
