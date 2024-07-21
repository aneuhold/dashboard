<script lang="ts">
  import { MockTaskSharedWith } from '$services/Task/TaskMapService/TaskMapService.mock';
  import SBMockData from '$storybook/globalMockData';
  import { DashboardTask } from '@aneuhold/core-ts-db-lib';
  import { ObjectId } from 'bson';
  import TaskDetails from '../TaskDetails.svelte';

  export let mainTaskExists = true;
  export let sharedWith: MockTaskSharedWith = MockTaskSharedWith.none;

  let mainTask: DashboardTask | undefined;
  $: taskId = mainTask ? mainTask._id.toString() : 'nonExistentTaskId';

  $: {
    SBMockData.taskMapServiceMock.reset();
    if (mainTaskExists) {
      let mainTaskOwnerId = SBMockData.currentUserCto._id;

      // sharedWith setup
      const sharedWithArray: ObjectId[] = [];
      switch (sharedWith) {
        case MockTaskSharedWith.none:
          break;
        case MockTaskSharedWith.withMe:
          sharedWithArray.push(SBMockData.currentUserCto._id);
          mainTaskOwnerId = SBMockData.collaborator1._id;
          break;
        case MockTaskSharedWith.withSinglePerson:
          sharedWithArray.push(SBMockData.collaborator1._id);
          break;
        case MockTaskSharedWith.withMultiplePeople:
          sharedWithArray.push(SBMockData.collaborator1._id, SBMockData.collaborator2._id);
          break;
      }

      mainTask = SBMockData.taskMapServiceMock.addTask({
        title: 'TestTask',
        sharedWith: sharedWithArray,
        ownerId: mainTaskOwnerId
      });
    }
  }
</script>

<TaskDetails {taskId} />
