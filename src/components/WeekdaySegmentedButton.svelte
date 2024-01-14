<script lang="ts">
  import SegmentedButton, { Label, Segment } from '@smui/segmented-button';

  export let weekDaySetOrChoice: Array<number> | number;
  export let disabled = false;

  type WeekDaySegment = {
    name: string;
    selected: boolean;
    value: number;
  };

  let defaultChoices: Array<WeekDaySegment> = [
    {
      name: 'Su',
      selected: false,
      value: 0
    },
    {
      name: 'Mo',
      selected: false,
      value: 1
    },
    {
      name: 'Tu',
      selected: false,
      value: 2
    },
    {
      name: 'We',
      selected: false,
      value: 3
    },
    {
      name: 'Th',
      selected: false,
      value: 4
    },
    {
      name: 'Fr',
      selected: false,
      value: 5
    },
    {
      name: 'Sa',
      selected: false,
      value: 6
    }
  ];

  let choices: Array<WeekDaySegment>;
  $: choices = getChoices(weekDaySetOrChoice);

  function getChoices(updatedWeekDaySet: Array<number> | number) {
    const weekDayChoiceIsNumber = typeof updatedWeekDaySet === 'number';
    return defaultChoices.map((segment) => {
      return {
        ...segment,
        selected: weekDayChoiceIsNumber
          ? segment.value === updatedWeekDaySet
          : updatedWeekDaySet.includes(segment.value)
      };
    });
  }

  function handleClick(segment: WeekDaySegment) {
    if (typeof weekDaySetOrChoice === 'number') {
      if (!segment.selected) {
        segment.selected = true;
        weekDaySetOrChoice = segment.value;
      }
    } else {
      // The week day hasn't been selected yet
      if (!segment.selected) {
        segment.selected = true;
        if (!weekDaySetOrChoice.includes(segment.value)) {
          weekDaySetOrChoice.push(segment.value);
        }
      } else {
        segment.selected = false;
        weekDaySetOrChoice = weekDaySetOrChoice.filter((value) => value !== segment.value);
      }
    }
    choices = choices;
  }
</script>

<SegmentedButton segments={choices} let:segment key={(segment) => segment.name}>
  <!--
      When the selected prop is provided, Segment will no longer fire a "selected"
      event.
    -->
  <Segment
    {disabled}
    {segment}
    selected={segment.selected}
    on:click={() => {
      handleClick(segment);
    }}
  >
    <Label>{segment.name}</Label>
  </Segment>
</SegmentedButton>
