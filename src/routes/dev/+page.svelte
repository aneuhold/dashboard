<script lang="ts">
  import SvelteIcon from '$lib/svgs/SvelteIcon.svelte';
  import List, { Graphic, Item, PrimaryText, SecondaryText, Text } from '@smui/list';
  import Paper, { Title, Subtitle, Content } from '@smui/paper';
</script>

<svelte:head>
  <title>Development</title>
  <meta name="description" content="Development info" />
</svelte:head>

<div class="title">
  <h4>Development Links and Info</h4>
</div>

<Paper variant="outlined">
  <Title>Architecture</Title>
  <Subtitle
    >The current chosen architecture for new projects. The order is from highest-level to
    lowest-level</Subtitle
  >
  <Content>
    <Paper>
      <Title>Frontend</Title>
      <Subtitle>Architecture for the frontend part of projects</Subtitle>
      <Content>
        <List twoLine>
          <Item
            on:SMUI:action={() => window.open('https://kit.svelte.dev/docs/introduction', '_blank')}
          >
            <Graphic class="material-icons"><SvelteIcon size={48} /></Graphic>
            <Text>
              <PrimaryText>SvelteKit</PrimaryText>
              <SecondaryText
                >The framework over Svelte that provides routing and other things</SecondaryText
              >
            </Text>
          </Item>
          <Item
            on:SMUI:action={() => window.open('https://svelte.dev/docs/introduction', '_blank')}
          >
            <Graphic class="material-icons"><SvelteIcon size={48} /></Graphic>
            <Text>
              <PrimaryText>Svelte</PrimaryText>
              <SecondaryText>The underlying frontend framework of choice</SecondaryText>
            </Text>
          </Item>
        </List>
      </Content>
    </Paper>
  </Content>
</Paper>

<style>
  .title {
    display: flex;
    justify-content: center;
  }
</style>
