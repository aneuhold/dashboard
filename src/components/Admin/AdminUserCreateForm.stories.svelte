<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import { createInvisibleArgTypes } from '$storybook/storybookUtil';
  import AdminUserCreateForm from './AdminUserCreateForm.svelte';

  const { Story } = defineMeta({
    title: 'Stateful Components/Admin/UserCreateForm',
    component: AdminUserCreateForm,
    argTypes: {
      ...createInvisibleArgTypes('onCreated', 'onCancel')
    },
    args: {
      onCreated: fn(),
      onCancel: fn()
    }
  });
</script>

<Story name="Default" />
