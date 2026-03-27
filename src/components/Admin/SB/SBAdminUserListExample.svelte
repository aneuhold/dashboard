<!--
  @component

  Storybook example wrapper for AdminUserList. Prevents actual navigation
  by capturing click events and displaying the selected user ID.
-->
<script lang="ts">
  import AdminUserList from '../AdminUserList.svelte';

  let {
    title = 'Users',
    subtitle = 'View and manage users',
    baseUrl = '/admin/users'
  }: {
    title?: string;
    subtitle?: string;
    baseUrl?: string;
  } = $props();
</script>

<AdminUserList {title} {subtitle} {baseUrl} />
