import SbConfettiDecorator from '$components/singletons/Confetti/SBConfettiDecorator.svelte';
import SBMockData from '$storybook/globalMockData';
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
  },
  beforeEach: () => {
    // Reset the mock
    SBMockData.taskMapServiceMock.reset();
  }
} satisfies Meta<SbTaskListExample>;
export default sbTaskListMeta;
