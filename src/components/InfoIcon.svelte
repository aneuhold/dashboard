<!--
  An info icon with a tooltip.
-->
<script lang="ts">
  import { Icon } from '@smui/icon-button';
  import Tooltip, { Content, Title, Wrapper } from '@smui/tooltip';

  export let title: string;
  export let content: string;
</script>

<div>
  <Wrapper class="infoIconWrapper" rich>
    <Icon class="material-icons dimmed-color">help_outline</Icon>
    <Tooltip persistent class="infoIconTooltip">
      <Title>{title}</Title>
      <Content>
        {content}
      </Content>
    </Tooltip>
  </Wrapper>
</div>

<style>
  /* Required so that it fits the icon for some reason */
  * :global(.infoIconWrapper) {
    height: 24px;
    cursor: pointer;
  }
  /* For some reason the auto width isn't working quite right so it's
      set to 200px for now. */
  * :global(.infoIconTooltip) {
    width: 300px;
    max-width: 100vw;
  }
</style>
