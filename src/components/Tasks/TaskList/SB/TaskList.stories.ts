import SbConfettiDecorator from '$components/singletons/Confetti/SBConfettiDecorator.svelte';
import SbSingletonTaskSharingDialogDecorator from '$components/singletons/dialogs/SingletonTaskSharingDialog/SBSingletonTaskSharingDialogDecorator.svelte';
import {
  MockTaskDescription,
  MockTaskSharedWith
} from '$services/Task/TaskMapService/TaskMapService.mock';
import { createEnumArgType } from '$storybook/storybookUtil';
import type { Meta } from '@storybook/svelte';
import SbTaskListExample from './SBTaskListExample.svelte';

const sbTaskListMeta = {
  title: 'Stateful Components/TaskList',
  component: SbTaskListExample,
  decorators: [
    () => ({ Component: SbConfettiDecorator }),
    () => ({ Component: SbSingletonTaskSharingDialogDecorator })
  ],
  argTypes: {
    sharedWith: createEnumArgType(MockTaskSharedWith),
    descriptions: createEnumArgType(MockTaskDescription)
  },
  args: {
    numTasks: 20,
    includeDueDates: false,
    includeOverDueDates: false,
    includeStartDates: false,
    includeStartDatesInFuture: false,
    sharedWith: MockTaskSharedWith.none,
    tags: [],
    descriptions: MockTaskDescription.none
  }
} satisfies Meta<SbTaskListExample>;
export default sbTaskListMeta;
