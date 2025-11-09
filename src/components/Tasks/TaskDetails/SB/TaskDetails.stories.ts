import SbConfettiDecorator from '$components/singletons/Confetti/SBConfettiDecorator.svelte';
import SbSingletonTaskAssignmentDialogDecorator from '$components/singletons/dialogs/SingletonTaskAssignmentDialog/SBSingletonTaskAssignmentDialogDecorator.svelte';
import SbSingletonTaskSharingDialogDecorator from '$components/singletons/dialogs/SingletonTaskSharingDialog/SBSingletonTaskSharingDialogDecorator.svelte';
import {
  MockTaskAssignment,
  MockTaskSharedWith
} from '$services/Task/TaskMapService/TaskMapService.mock';
import { createEnumArgType } from '$storybook/storybookUtil';
import type { Meta } from '@storybook/svelte';
import SbTaskDetailsExample from './SBTaskDetailsExample.svelte';

const sbTaskDetailsMeta: Meta<SbTaskDetailsExample> = {
  title: 'Stateful Components/TaskDetails',
  component: SbTaskDetailsExample,
  decorators: [
    () => ({ Component: SbConfettiDecorator }),
    () => ({ Component: SbSingletonTaskSharingDialogDecorator }),
    () => ({ Component: SbSingletonTaskAssignmentDialogDecorator })
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
};
export default sbTaskDetailsMeta;
