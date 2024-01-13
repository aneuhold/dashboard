<script lang="ts">
  import Select, { Option } from '@smui/select';
  import WeekdaySegmentedButton from 'components/WeekdaySegmentedButton.svelte';

  export let weekDay: number;
  export let weekOfMonth: number | 'last';
  export let disabled = false;
</script>

<div class="container">
  <div class="container">
    <span>Every</span>
    <Select {disabled} bind:value={weekOfMonth}>
      <Option value={0}>1st</Option>
      <Option value={1}>2nd</Option>
      <Option value={2}>3rd</Option>
      <Option value={3}>4th</Option>
      <Option value={'last'}>Last</Option>
    </Select>
  </div>
  <WeekdaySegmentedButton {disabled} bind:weekDaySetOrChoice={weekDay} />
  <span>of the month</span>
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
</style>
