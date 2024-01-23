<script lang="ts">
  import Button, { Label } from '@smui/button';
  import Dialog, { Actions, Content, Title } from '@smui/dialog';
  import InputBox from 'components/presentational/InputBox.svelte';
  import TaskTagsService from '../../../services/Task/TaskTagsService';

  export let open = false;
  export let tagName: string;

  $: tagEditorValue = tagName;
  $: doneDisabled = tagEditorValue === '' || tagEditorValue === tagName;

  const handleCancel = () => {
    open = false;
  };
  const handleDone = () => {
    open = false;
    if (tagEditorValue !== tagName) {
      TaskTagsService.updateTag(tagName, tagEditorValue);
    }
  };
</script>

<Dialog bind:open>
  <Title>Edit "{tagName}" Tag</Title>
  <Content>
    <InputBox label="Tag Name" bind:inputValue={tagEditorValue} />
  </Content>
  <Actions>
    <Button on:click={handleCancel}>
      <Label>Cancel</Label>
    </Button>
    <Button on:click={handleDone} disabled={doneDisabled}>
      <Label>Done</Label>
    </Button>
  </Actions>
</Dialog>
