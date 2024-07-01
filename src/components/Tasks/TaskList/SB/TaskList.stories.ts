import SbConfettiDecorator from '$components/singletons/Confetti/SBConfettiDecorator.svelte';
import type { Meta } from '@storybook/svelte';
import SbTaskListExample from './SBTaskListExample.svelte';

const sbTaskListMeta = {
  title: 'Stateful Components/TaskList',
  component: SbTaskListExample,
  decorators: [() => ({ Component: SbConfettiDecorator })],
  argTypes: {},
  args: {
    numTasks: 20,
    includeDueDates: false,
    includeOverDueDates: false,
    includeStartDates: false,
    includeStartDatesInFuture: false
  }
} satisfies Meta<SbTaskListExample>;
export default sbTaskListMeta;
