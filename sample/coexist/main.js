// coexist — 「$$ と Svelte を同じページに置くと、$$ はどこで効いてどこで無効か」を実証する。
import { $$, mount, useEngine } from "../../src/index.js";
import { svelteEngine } from "../../src/engines/svelte.js";
import App from "./App.svelte";

useEngine(svelteEngine);
window.$$ = $$; // harness から触れるように公開
const app = mount(App, { target: "#app" });

// Svelte管轄「外」のノードは $$ の縄張り。自由に効く。
$$("#outside-title").text("★ $$が書き換えた(外側)").addClass("touched");

// 内側ノードへの相乗りは harness がタイミングを制御して観測する(ここでは触らない)。
window.__app = app;
