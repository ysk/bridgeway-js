// migrate — bridgey の“うま味”の実証。
//   レガシー(jQuery)のイベント入力 × 島(Svelte)の描画 を、共有 state で橋渡しする。
//   ・入力/イベント = jQueryの手癖のまま($$)
//   ・描画          = 本物のSvelteに委譲
//   ・両者の会話     = state()  ← ここが橋。ノードには相乗りしない(断線しない)
import { $$, state, computed, mount, useEngine } from "../../src/index.js";
import { svelteEngine } from "../../src/engines/svelte.js";
import App from "./App.svelte";

useEngine(svelteEngine);

const ALL = ["apple", "banana", "cherry", "grape", "melon", "orange", "peach"];

// 共有 state = 橋。
const query = state("");
const results = computed(query, (q) => (q ? ALL.filter((x) => x.includes(q)) : ALL));

// ── レガシー側(jQuery) ── DOMを直接いじらず、共有 state に書くだけ。
$$("#q").on("input", (e) => (query.value = e.target.value));
$$("#clear").on("click", () => {
  query.value = "";
  $$("#q").val(""); // 自分の縄張り(島の外)の入力欄はjQueryで操作してOK
});

// ── 島(Svelte) ── 共有 state を渡して描画を丸投げ。
const app = mount(App, { target: "#island", props: { query, items: results } });

// ── 島 → レガシー ── Svelteが出したイベントを、レガシー領域のノードにjQueryで反映。
app.on("pick", (e) => $$("#picked").text("選択: " + e.detail));

// harness 用
window.$$ = $$;
window.__bridge = { query, results, app };
