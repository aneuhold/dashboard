<!--
  @component

  Read-only display of a user's DashboardUserConfig and document counts.
-->
<script lang="ts">
  import type { AdminOutputUserDetail } from '@aneuhold/core-ts-api-lib';
  import Paper, { Content, Title } from '@smui/paper';

  let { userDetail }: { userDetail: AdminOutputUserDetail } = $props();
</script>

<Paper>
  <Title>Auth Info</Title>
  <Content>
    <div class="info-list">
      <div>Has password: {userDetail.user.auth.password ? 'Yes' : 'No'}</div>
      <div>Has Google ID: {userDetail.user.auth.googleId ? 'Yes' : 'No'}</div>
    </div>
  </Content>
</Paper>

{#if userDetail.documentCounts}
  <Paper>
    <Title>Document Counts</Title>
    <Content>
      <div class="info-list">
        {#each Object.entries(userDetail.documentCounts) as [key, value] (key)}
          <div>{key}: {value}</div>
        {/each}
      </div>
    </Content>
  </Paper>
{/if}

{#if userDetail.userConfig}
  <Paper>
    <Title>Dashboard User Config</Title>
    <Content>
      <div class="info-list">
        <div>Dev mode: {userDetail.userConfig.enableDevMode ? 'Yes' : 'No'}</div>
        <div>Admin page: {userDetail.userConfig.enableAdminPage ? 'Yes' : 'No'}</div>
        <div>Collaborators: {userDetail.userConfig.collaborators.length}</div>
        <div>Auto task deletion: {userDetail.userConfig.autoTaskDeletionDays} days</div>
        <div class="config-features">
          <strong>Features:</strong>
          {#each Object.entries(userDetail.userConfig.enabledFeatures) as [key, value] (key)}
            <div class="feature-item">{key}: {value ? 'On' : 'Off'}</div>
          {/each}
        </div>
      </div>
    </Content>
  </Paper>
{/if}

<style>
  .info-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .config-features {
    margin-top: 8px;
  }
  .feature-item {
    margin-left: 16px;
  }
</style>
