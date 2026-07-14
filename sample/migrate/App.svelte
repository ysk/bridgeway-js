<script>
  import { createEventDispatcher } from "svelte";

  // bridgey の state() / computed() をそのまま props で受け取る。
  // これらは Svelteストア互換(.subscribe を持つ)なので $query / $items で読める。
  export let query;
  export let items;

  const dispatch = createEventDispatcher();
</script>

<div class="island">
  <p>検索語: <strong>{$query || "(未入力)"}</strong> — {$items.length}件</p>
  <ul>
    {#each $items as it}
      <li><button on:click={() => dispatch("pick", it)}>{it}</button></li>
    {/each}
  </ul>
</div>
