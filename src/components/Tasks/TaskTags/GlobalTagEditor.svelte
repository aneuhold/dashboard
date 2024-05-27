<script lang="ts">
  import InputBox from '$components/presentational/InputBox.svelte';
  import SmartDialog from '$components/presentational/SmartDialog.svelte';
  import { userSettings } from '$stores/userSettings';
  import Button, { Label } from '@smui/button';
  import { Actions, Content, Title } from '@smui/dialog';
  import TaskTagsService from '../../../services/Task/TaskTagsService';

  export let open = false;
  /**
   * The tag name to update. If not provided, the editor will be in "add" mode.
   */
  export let tagName: string | undefined = undefined;

  $: tagEditorValue = tagName ?? '';
  $: tagValueIsValid = validateTagEditorValue(tagEditorValue);
  $: buttonIsDisabled = !tagValueIsValid || tagEditorValue === tagName;
  $: tagEditorTitle = tagName ? `Edit "${tagName}" Tag` : 'Add New Tag';

  const handleCancel = () => {
    open = false;
  };
  const handleDone = () => {
    if (tagEditorValue !== tagName) {
      if (tagName) {
        TaskTagsService.updateTag(tagName, tagEditorValue);
      } else {
        TaskTagsService.addTagForUser(tagEditorValue);
      }
    }
    open = false;
  };

  const validateTagEditorValue = (value: string) => {
    if (tagEditorValue === '') return false;
    return tagEditorValue === tagName || !$userSettings.config.tagSettings[value];
  };
</script>

<SmartDialog bind:open>
  <Title>{tagEditorTitle}</Title>
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
</SmartDialog>
