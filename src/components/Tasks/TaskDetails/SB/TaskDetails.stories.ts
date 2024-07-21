import SbConfettiDecorator from '$components/singletons/Confetti/SBConfettiDecorator.svelte';
import SbSingletonTaskSharingDialogDecorator from '$components/singletons/dialogs/SingletonTaskSharingDialog/SBSingletonTaskSharingDialogDecorator.svelte';
import type { Meta } from '@storybook/svelte';
import SbTaskDetailsExample from './SBTaskDetailsExample.svelte';

const sbTaskDetailsMeta = {
  title: 'Stateful Components/TaskDetails',
  component: SbTaskDetailsExample,
  decorators: [
    () => ({ Component: SbConfettiDecorator }),
    () => ({ Component: SbSingletonTaskSharingDialogDecorator })
  ],
  argTypes: {},
  args: {
    mainTaskExists: true
  }
} satisfies Meta<SbTaskDetailsExample>;
export default sbTaskDetailsMeta;
