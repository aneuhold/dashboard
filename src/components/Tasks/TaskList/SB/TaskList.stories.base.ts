import SbConfettiDecorator from '$components/singletons/Confetti/SBConfettiDecorator.svelte';
import SbSingletonTaskAssignmentDialogDecorator from '$components/singletons/dialogs/SingletonTaskAssignmentDialog/SBSingletonTaskAssignmentDialogDecorator.svelte';
import SbSingletonTaskSharingDialogDecorator from '$components/singletons/dialogs/SingletonTaskSharingDialog/SBSingletonTaskSharingDialogDecorator.svelte';
import {
  MockTaskAssignment,
  MockTaskDescription,
  MockTaskSharedWith,
  MockTaskSubTasks
} from '$services/Task/TaskMapService/TaskMapService.mock';
import { createEnumArgType } from '$storybook/storybookUtil';
import { defineMeta } from '@storybook/addon-svelte-csf';
import SbTaskListExample from './SBTaskListExample.svelte';

const sbTaskListMetaBase: Parameters<typeof defineMeta>[0] = {
  title: 'Stateful Components/TaskList',
  component: SbTaskListExample,
  decorators: [
    // @ts-expect-error - Decorator type mismatch between Storybook and Svelte - see https://github.com/storybookjs/storybook/issues/29951
    () => SbConfettiDecorator,
    // @ts-expect-error - Decorator type mismatch between Storybook and Svelte
    () => SbSingletonTaskSharingDialogDecorator,
    // @ts-expect-error - Decorator type mismatch between Storybook and Svelte
    () => SbSingletonTaskAssignmentDialogDecorator
  ],
  argTypes: {
    sharedWith: createEnumArgType(MockTaskSharedWith),
    assignedTo: createEnumArgType(MockTaskAssignment),
    descriptions: createEnumArgType(MockTaskDescription),
    subtasks: createEnumArgType(MockTaskSubTasks)
  },
  args: {
    numTasks: 20,
    includeDueDates: false,
    includeOverDueDates: false,
    includeStartDates: false,
    includeStartDatesInFuture: false,
    sharedWith: MockTaskSharedWith.none,
    assignedTo: MockTaskAssignment.none,
    tags: [],
    descriptions: MockTaskDescription.none,
    subtasks: MockTaskSubTasks.none
  }
};

export default sbTaskListMetaBase;
