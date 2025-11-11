<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { userSettings } from '$stores/userSettings/userSettings';
  import { createNumberArgTypes } from '$storybook/storybookUtil';
  import SbConfettiExample from './SBConfettiExample.svelte';

  const { Story } = defineMeta({
    title: 'Singleton Components/Confetti',
    component: SbConfettiExample,
    argTypes: {
      ...createNumberArgTypes('numButtons')
    },
    beforeEach: () => {
      userSettings.update((settings) => {
        settings.config.enabledFeatures.useConfettiForTasks = true;
        return settings;
      });
    }
  });
</script>

<Story name="Default" args={{ numButtons: 1 }} />
<Story name="Multiple Confetti" args={{ numButtons: 55 }} />
