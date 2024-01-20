<script lang="ts">
  import ClickableDiv from 'components/presentational/ClickableDiv.svelte';
  import SquareIconButton from 'components/presentational/SquareIconButton.svelte';

  let sortDisabled = false;
  let filterDisabled = false;
</script>

<div class="container">
  <ClickableDiv
    clickAction={() => {
      sortDisabled = !sortDisabled;
    }}
  >
    <SquareIconButton iconName="sort" variant="outlined" disabled={sortDisabled} />
  </ClickableDiv>
  <ClickableDiv
    clickAction={() => {
      filterDisabled = !filterDisabled;
    }}
  >
    <SquareIconButton iconName="filter_list" variant="outlined" disabled={filterDisabled} />
  </ClickableDiv>
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 8px;
  }
</style>
