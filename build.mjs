// build.mjs — npm/CDN で配る成果物を dist/ に「結合(bundle)＋minify」して出力。
//   実行: node build.mjs   (npm run build)
//
// 出力物(すべて minify 済み。ライセンスバナー /*! … */ だけ残す):
//
//   ■ npm の import 経路(ESM。svelte/vue は external = 巻き込まない)
//     dist/bridgey.esm.js        … import "bridgey"        の本体(エンジン非同梱)
//     dist/engines/svelte.js       … import "bridgey/engines/svelte.js"
//     dist/engines/vue.js          … import "bridgey/engines/vue.js"
//
//   ■ <script src> の CDN 経路(IIFE。エンジンを同梱してビルド不要)
//     dist/bridgey.js               … Svelteエンジン同梱(軽量)。$$ / state / computed 中心。
//     dist/bridgey.vue.js           … Vueフルビルド(実行時コンパイラ)同梱。ビルド不要で mount まで動く。
//
// package.json の main/module/exports は dist/ を指す。src/ は配布物に含めない。

import { rollup } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import terser from "@rollup/plugin-terser";

// ライセンスバナー(/*! … */)だけ残し、それ以外のコメントは削除して minify。
// module:true は ESM 出力時にトップレベルも安全に mangle するための指定。
const minify = (module) => terser({ module, format: { comments: /^!/ } });

const MIT = "bridgey is MIT licensed.";

const builds = [
  // ── npm: import "bridgey"(本体) ── svelte/vue は external ────────────────
  {
    input: "src/index.js",
    file: "dist/bridgey.esm.js",
    format: "es",
    external: ["svelte", "svelte/store", "vue"],
    banner: `/*! bridgey — jQueryの書き味でモダン開発 (ESM本体・エンジン非同梱). ${MIT} */`,
    plugins: [nodeResolve(), minify(true)],
  },
  // ── npm: import "bridgey/engines/svelte.js" ── svelte は external ─────────
  {
    input: "src/engines/svelte.js",
    file: "dist/engines/svelte.js",
    format: "es",
    external: ["svelte", "svelte/store"],
    banner: `/*! bridgey svelte engine. ${MIT} */`,
    plugins: [nodeResolve(), minify(true)],
  },
  // ── npm: import "bridgey/engines/vue.js" ── vue は external ───────────────
  {
    input: "src/engines/vue.js",
    file: "dist/engines/vue.js",
    format: "es",
    external: ["vue"],
    banner: `/*! bridgey vue engine. ${MIT} */`,
    plugins: [nodeResolve(), minify(true)],
  },
  // ── CDN: <script src="bridgey.js">(Svelteエンジン同梱) ──────────────────────
  {
    input: "src/global.js",
    file: "dist/bridgey.js",
    format: "iife",
    name: "bridgey",
    banner:
      "/*! bridgey — jQuery感覚でモダン開発 / グローバル版(Svelteエンジン同梱). bridgey is MIT licensed.\n" +
      " * Bundles Svelte (MIT, Copyright (c) 2016-23 the Svelte contributors). See THIRD-PARTY-NOTICES.md. */",
    plugins: [nodeResolve(), minify(false)],
  },
  // ── CDN: <script src="bridgey.vue.js">(Vueフルビルド同梱・ビルド不要) ────────
  {
    input: "src/global.vue.js",
    file: "dist/bridgey.vue.js",
    format: "iife",
    name: "bridgey",
    banner:
      "/*! bridgey.vue.js — jQuery感覚でモダン開発 / グローバル版(Vueフルビルド同梱・ビルド不要). bridgey is MIT licensed.\n" +
      " * Bundles Vue (MIT, Copyright (c) 2018-present Yuxi (Evan) You). See THIRD-PARTY-NOTICES.md. */",
    plugins: [
      alias({ entries: [{ find: /^vue$/, replacement: "vue/dist/vue.esm-browser.prod.js" }] }),
      nodeResolve({ browser: true, dedupe: ["vue"] }),
      minify(false),
    ],
  },
];

for (const b of builds) {
  const bundle = await rollup({
    input: b.input,
    external: b.external,
    plugins: b.plugins,
    onwarn(w, warn) {
      if (/__VUE|CIRCULAR/.test(w.code + (w.message || ""))) return;
      warn(w);
    },
  });
  await bundle.write({
    file: b.file,
    format: b.format,
    name: b.name,
    banner: b.banner,
  });
  await bundle.close();
  console.log("built:", b.file);
}
