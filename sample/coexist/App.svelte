<script>
  // Svelteが「管理する」サブツリー。count はこのコンポーネントの状態。
  let count = 0;
</script>

<div class="svelte-zone">
  <button id="svelte-inc" on:click={() => (count += 1)}>＋</button>
  <!-- 同じ count を2箇所に描画。label だけ $$ で触り、mirror は触らない。 -->
  <span id="count-label">{count}</span>
  <span id="count-mirror">{count}</span>
</div>
