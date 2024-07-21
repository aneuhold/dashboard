import SbConfettiDecorator from '$components/singletons/Confetti/SBConfettiDecorator.svelte';
import SbSingletonTaskSharingDialogDecorator from '$components/singletons/dialogs/SingletonTaskSharingDialog/SBSingletonTaskSharingDialogDecorator.svelte';
import {
  MockTaskAssignment,
  MockTaskSharedWith
} from '$services/Task/TaskMapService/TaskMapService.mock';
import { createEnumArgType } from '$storybook/storybookUtil';
import type { Meta } from '@storybook/svelte';
import SbTaskDetailsExample from './SBTaskDetailsExample.svelte';

const sbTaskDetailsMeta = {
  title: 'Stateful Components/TaskDetails',
  component: SbTaskDetailsExample,
  decorators: [
    () => ({ Component: SbConfettiDecorator }),
    () => ({ Component: SbSingletonTaskSharingDialogDecorator })
  ],
  argTypes: {
    sharedWith: createEnumArgType(MockTaskSharedWith),
    assignedTo: createEnumArgType(MockTaskAssignment)
  },
  args: {
    mainTaskExists: true,
    sharedWith: MockTaskSharedWith.none,
    assignedTo: MockTaskAssignment.none
  }
} satisfies Meta<SbTaskDetailsExample>;
export default sbTaskDetailsMeta;
