import { defineMeta } from '@storybook/addon-svelte-csf';
import SBSingletonConfirmationDialogDecorator from '$components/singletons/dialogs/SingletonConfirmationDialog/SBSingletonConfirmationDialogDecorator.svelte';
import SBAdminUserDetailExample from './SBAdminUserDetailExample.svelte';

const sbAdminUserDetailMetaBase: Parameters<typeof defineMeta>[0] = {
  title: 'Stateful Components/Admin/UserDetail',
  component: SBAdminUserDetailExample,
  decorators: [() => ({ Component: SBSingletonConfirmationDialogDecorator })]
};

export default sbAdminUserDetailMetaBase;
