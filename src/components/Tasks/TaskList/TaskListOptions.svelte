<script lang="ts">
  import Button, { Icon } from '@smui/button';
</script>

<div class="container">
  <Button>Test</Button>
  <Button variant="outlined" class="squareIconButton">
    <Icon class="material-icons taskListOptionIcon">filter_list</Icon>
  </Button>
  <Button variant="outlined" class="squareIconButton">
    <Icon class="material-icons taskListOptionIcon">filter_list</Icon>
  </Button>
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    width: 100%;
  }

  * :global(.taskListOptionIcon) {
    margin: 0px;
  }

  * :global(.squareIconButton) {
    min-width: 42px;
  }
</style>
