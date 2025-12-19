<script lang="ts">
  import { SvelteMap } from 'svelte/reactivity';

  // --- 1. Deep Reactive Object ---
  // $state() makes simple objects and arrays deeply reactive proxies.
  let deepObj = $state({
    user: {
      name: 'Alice',
      someOtherObject: {
        something: 'value'
      },
      settings: {
        theme: 'dark',
        notifications: {
          email: true,
          sms: false
        }
      }
    },
    stats: {
      visits: 0
    }
  });

  // --- 2. SvelteMap with Plain Objects ---
  // SvelteMap is reactive for map operations (set, delete, clear),
  // but values inside are NOT automatically made deeply reactive.
  let plainMap = new SvelteMap<string, { count: number }>();
  plainMap.set('item-A', { count: 1 });
  plainMap.set('item-B', { count: 2 });

  // --- 3. SvelteMap with Reactive Objects ---
  // If we want granular reactivity inside map values, we wrap them in $state().
  let reactiveMap = new SvelteMap<string, { count: number }>();
  const itemX = $state({ count: 10 });
  const itemY = $state({ count: 20 });
  reactiveMap.set('item-X', itemX);
  reactiveMap.set('item-Y', itemY);

  // --- Actions ---

  function updateDeepName(e: Event) {
    const target = e.target as HTMLInputElement;
    deepObj.user.name = target.value;
  }

  function updateDeepSomething(e: Event) {
    const target = e.target as HTMLInputElement;
    const user = deepObj.user;
    const someOtherObject = user.someOtherObject;
    console.log(someOtherObject);
    someOtherObject.something = target.value;
  }

  function toggleTheme() {
    deepObj.user.settings.theme = deepObj.user.settings.theme === 'dark' ? 'light' : 'dark';
  }

  function toggleEmailNotif() {
    // Deeply nested update
    deepObj.user.settings.notifications.email = !deepObj.user.settings.notifications.email;
  }

  function mutatePlainMapItem(key: string) {
    const item = plainMap.get(key);
    if (item) {
      // This mutation will NOT trigger a UI update for the specific item
      // because 'item' is a plain object and the map doesn't know it changed.
      item.count++;
      console.log(`Mutated plain item ${key} to ${item.count} (no UI update expected)`);
    }
  }

  function mutateAndSetPlainMapItem(key: string) {
    const item = plainMap.get(key);
    if (item) {
      item.count++;
      // Calling .set() triggers the map's reactivity
      plainMap.set(key, item);
    }
  }

  function mutateReactiveMapItem(key: string) {
    const item = reactiveMap.get(key);
    if (item) {
      // This mutation WILL trigger a UI update because 'item' is a state proxy.
      // We don't need to call reactiveMap.set().
      item.count++;
    }
  }
</script>

<div class="reactivity-test">
  <h2>Svelte 5 Reactivity Test</h2>

  <!-- Section 1: Deep Object -->
  <section class="card">
    <h3>1. Deep Reactive Object ($state)</h3>
    <div class="content">
      <pre>{JSON.stringify(deepObj, null, 2)}</pre>

      <div class="controls">
        <label>
          Name: <input value={deepObj.user.name} oninput={updateDeepName} />
        </label>
        <label>
          Something: <input
            value={deepObj.user.someOtherObject.something}
            oninput={updateDeepSomething}
          />
        </label>
        <button onclick={() => deepObj.stats.visits++}>
          Increment Visits (deepObj.stats.visits++)
        </button>
        <button onclick={toggleTheme}> Toggle Theme (deepObj.user.settings.theme) </button>
        <label>
          <input
            type="checkbox"
            checked={deepObj.user.settings.notifications.email}
            onchange={toggleEmailNotif}
          />
          Email Notifications
        </label>
      </div>
    </div>
  </section>

  <!-- Section 2: Map with Plain Objects -->
  <section class="card">
    <h3>2. SvelteMap (Plain Values)</h3>
    <p class="note">
      Mutating plain objects inside a SvelteMap does NOT trigger updates unless you call <code
        >map.set()</code
      > again.
    </p>
    <div class="list">
      {#each plainMap as [key, item] (key)}
        <div class="item">
          <span>{key}: <strong>{item.count}</strong></span>
          <div class="buttons">
            <button
              onclick={() => {
                mutatePlainMapItem(key);
              }}
            >
              Mutate Only (No Update)
            </button>
            <button
              onclick={() => {
                mutateAndSetPlainMapItem(key);
              }}
            >
              Mutate + Set (Update)
            </button>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Section 3: Map with Reactive Objects -->
  <section class="card">
    <h3>3. SvelteMap (Reactive Values)</h3>
    <p class="note">
      Values wrapped in <code>$state()</code> are deeply reactive. Direct mutation works.
    </p>
    <div class="list">
      {#each reactiveMap as [key, item] (key)}
        <div class="item">
          <span>{key}: <strong>{item.count}</strong></span>
          <button
            onclick={() => {
              mutateReactiveMapItem(key);
            }}
          >
            Mutate Directly (Update)
          </button>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .reactivity-test {
    font-family: sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  h3 {
    margin-top: 0;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
  }

  .note {
    font-size: 0.9em;
    color: #666;
    padding: 8px;
    border-radius: 4px;
  }

  .content {
    display: flex;
    gap: 20px;
  }

  pre {
    background: gray;
    padding: 10px;
    border-radius: 4px;
    font-size: 12px;
    flex: 1;
    overflow: auto;
  }

  .controls {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-radius: 4px;
  }

  .buttons {
    display: flex;
    gap: 5px;
  }

  button {
    cursor: pointer;
    padding: 4px 8px;
  }
</style>
