<script lang="ts">
  import Button, { Label } from '@smui/button';
  import Dialog, { Actions, Content, Title } from '@smui/dialog';
  import InputBox from 'components/presentational/InputBox.svelte';
  import TaskTagsService from '../../../services/Task/TaskTagsService';
  import { userSettings } from '../../../stores/userSettings';

  export let open = false;
  export let tagName: string;

  $: tagEditorValue = tagName;
  $: tagValueIsValid = validateTagEditorValue(tagEditorValue);
  $: buttonIsDisabled = !tagValueIsValid || tagEditorValue === tagName;

  const handleCancel = () => {
    open = false;
  };
  const handleDone = () => {
    open = false;
    if (tagEditorValue !== tagName) {
      TaskTagsService.updateTag(tagName, tagEditorValue);
    }
  };

  const validateTagEditorValue = (value: string) => {
    return tagEditorValue === tagName || (!$userSettings.config.tagSettings[value] && value !== '');
  };
</script>

<Dialog bind:open>
  <Title>Edit "{tagName}" Tag</Title>
  <Content>
    <InputBox label="Tag Name" isValid={tagValueIsValid} bind:inputValue={tagEditorValue} />
  </Content>
  <Actions>
    <Button on:click={handleCancel}>
      <Label>Cancel</Label>
    </Button>
    <Button on:click={handleDone} disabled={buttonIsDisabled}>
      <Label>Done</Label>
    </Button>
  </Actions>
</Dialog>
