# bridgey.js

## jQueryの手に、リアクティビティを。

覚えるのは `$` を `$$` にするだけ。使い慣れたjQueryの書き味に、**自動で反映される状態（`state` / `computed`）**が加わります。「数量を変えたら合計も勝手に直る」——**ビルドもコンポーネントも要らず**、`<script>` 一本から。

複雑になった画面は、そのまま**本物のSvelte／Vue**へ引き上げ（`mount`）。DOMの差分更新・後片付けは実績あるエンジンに委ね、フォーカスも入力途中も飛ばしません。

**もう新しいフロントエンドフレームワークに翻弄されない** 
エンジンは差し替え式。利用者が書く `$$ / state / mount` は、下がSvelteでもVueでも変わりません。

---

## 何を提供して、何を提供しないか

**bridgeyが担うのは2つだけ（薄い皮）:**
1. `$$` … jQueryの書き味の命令的グルー（イベント・クラス・テキスト。既存の手がそのまま動く入口）
2. `state` / `computed` / `mount` … リアクティブ状態とコンポーネントのライフサイクル（下のエンジンに委譲）

**提供しないもの（意図的。“薄いヘルパー”に留める）:**
- ルーティング / スコープCSS / 独自コンポーネント境界 → それは下のフレームワーク（Svelte）の仕事
- **jQueryとの共存機構**（領域自動判定・再適用フック等）

> **共存について:** 「サポートしない」＝機能として売らない、という意味で、**不可能ではありません**。Svelteは `mount` した要素のサブツリーだけを管理し、外には触れません。だから「カルーセル＝jQueryの領域 / フォーム＝Svelteの領域」と**ノードを分ければ、コーダーの工夫で共存できます**（自己責任）。禁止は「同一ノードを両者に相乗りさせる」ことだけです。なお開発時は、`mount` 管理下のノードを `$$` で書き換えようとすると**警告が出ます**（再描画でズレる事故を防ぐため。`$$.warnOnManagedNodes = false` で無効化可）。

---

## 使い方

```
your-app/
├─ App.svelte     ← 構造・制御構文・DOM更新（本物のSvelte）
├─ main.js        ← bridgeyの書き味で載せる
└─ index.html     ← <div id="app"></div> と <script src="app.js">
```

```svelte
<!-- App.svelte -->
<script>
  export let name = "world";
  let count = 0;
  $: doubled = count * 2;         // 式はビルド時コンパイル（evalではない）
</script>
<button on:click={() => count++}>＋</button>
<span class:big={count >= 10}>{count}</span> / 2倍 {doubled}
{#if count > 10}<p>10超え</p>{/if}
```

```js
// main.js
import { $$, state, mount } from "bridgey";   // ← 開発中は "../../src/index.js"
import App from "./App.svelte";

const app = mount(App, { target: "#app", props: { name: "bridgey" } });

// jQueryの書き味の命令的グルーはそのまま使える
$$("#reset").on("click", () => app.set({ name: "world" }));
$$("#destroy").on("click", () => app.destroy()); // 購読もDOMもSvelteが片付ける
```

利用者が触るのは `$$ / state / mount` の3つだけ。学習コストは「jQuery＋α」。

---

## 2つの入り方

**① npm（本格運用）**

```bash
npm install bridgey
npm install svelte   # または vue（使う方だけ。optional peer）
```

**② `<script>`で読み込む（CDN・ビルド不要）**

npmに公開済みなので、jsDelivr / unpkg からそのまま読めます。

```html
<!-- Vueフルビルド同梱。mount まで全部動く -->
<script src="https://cdn.jsdelivr.net/npm/bridgey/dist/bridgey.vue.js"></script>
<!-- unpkg でも可: https://unpkg.com/bridgey/dist/bridgey.vue.js -->
<script>
  const App = { data: () => ({ n: 0 }), template: `<button @click="n++">{{ n }}</button>` };
  mount(App, { target: "#app" });   // $$ / state / mount は window に
</script>
```

配信ファイル（`dist/`）:

| ファイル | 内容 | CDN URL |
| --- | --- | --- |
| `bridgey.vue.js` | Vueフルビルド同梱。ビルド不要で template 文字列の部品を `mount` まで | `https://cdn.jsdelivr.net/npm/bridgey/dist/bridgey.vue.js` |
| `bridgey.js` | Svelte(軽量)同梱。`$$ / state / computed` 中心 | `https://cdn.jsdelivr.net/npm/bridgey/dist/bridgey.js` |

> **バージョン固定推奨:** 本番では `bridgey@1`（メジャー固定）や `bridgey@1.0.0`（完全固定）のように指定します。例: `https://cdn.jsdelivr.net/npm/bridgey@1/dist/bridgey.vue.js`
>
> ローカルの `dist/` は `npm run build`（`build.mjs`）で再生成できます。

## 新規プロジェクトを作る（CLI）

`brg init` が、選んだフレームワーク・言語に**配線済みのスタータ**を生成します。

```bash
npx brg init my-app
#  フレームワークを選択:  1) svelte  2) vue
#  言語を選択:            1) js      2) ts
#  → my-app/ に App.(svelte|js|ts) / main.(js|ts) / build.mjs / index.html を生成
#     ts を選ぶと tsconfig.json と型宣言 bridgey-env.d.ts も同梱

# 非対話でも指定可
npx brg init my-app --framework vue --lang ts
```

生成される `main.(js|ts)` は `$$ / state / mount` で共通。**違いはエンジン選択（Vueなら `useEngine(vueEngine)` の1行）と部品の書式・言語だけ**。あとで別ディレクトリに逆のフレームワークで作り直せば、利用者コードはほぼそのまま移せます。

> TypeScript 版は、bridgey 本体がまだ型定義を同梱していないため、生成プロジェクトに暫定のアンビエント型宣言（`bridgey-env.d.ts`）を置いて型を効かせています。本体が `.d.ts` を配布し始めたら、このファイルは削除して構いません。

---

## アーキテクチャ（エンジン差し替え）

```
利用者コード（$$ / state / mount）  ← ここは常に不変
        │
   src/engine.js（レジストリ / useEngine）
        │
   ┌────┴─────┐
svelteEngine   vueEngine（将来）
 state=writable  state=ref/reactive
 computed=derived computed=computed
 mount=new Component  mount=createApp
```

- `src/engines/svelte.js` … 既定エンジン。`state`/`computed`/`mount` を本物のSvelteで実装
- `src/mount.js` … `mount()` は現在のエンジンの `mount` へ委譲（Svelte決め打ちにしない）
- 将来ビジョン: `npm install bridgey` → `select framework: ◯ svelte ◯ vue` でエンジンを自動配線

配布用グローバルビルド（`<script>`向け）は `npm run build`（`build.mjs`）で `bridgey` を再生成します。ただし `mount` はコンパイル済みコンポーネントを渡す前提なので、実運用では利用者側のビルドと併用します。

---

## コンセプト

- **ターゲット:** レガシー環境でjQuery保守が続く人／WordPress等でモダンFWを入れる機会がない人／jQueryならわかる人
- **必須要件:** 書き味はjQueryのまま／裏で本物のモダンFWが動く／学習コストを限りなく下げる
- **将来:** Svelteに加えVue等へエンジンを差し替え可能に（対話的に選べるように）
- **背景:** 作者自身がjQuery→Vueの移行でとん挫した。あの頃の自分を救うために、モダンを“楽に”始められる薄い橋を架ける

---

## リリース手順（次のバージョンを publish）

メンテナ向け。`prepack` で `dist/` が自動ビルドされるので、手動ビルドは不要です。

```bash
# 1) バージョンを上げる（package.json 更新 + git があれば commit+tag）
npm version patch     # 1.0.0 → 1.0.1（バグ修正）
npm version minor     # 1.0.0 → 1.1.0（後方互換の機能追加）
npm version major     # 1.0.0 → 2.0.0（破壊的変更）

# 2) 中身を最終確認（実送信しない。prepack ビルド込み）
npm publish --dry-run

# 3) 公開
npm publish

# 4) 確認 & タグを push
npm view bridgey version          # 新バージョンが出ればOK
git push --follow-tags            # git を使っている場合
```

- CDN（jsDelivr / unpkg）は公開後**数分〜十数分で自動反映**されます。即時に固定したい場合は `bridgey@<version>` を指定。
- 公開前チェックや名前まわりの詳細は [PUBLISHING.md](./PUBLISHING.md) を参照。

---

## ライセンス

bridgey は [MIT License](./LICENSE)。

配布ビルド（`dist/`）には Svelte / Vue（いずれもMIT）が同梱されます。各ライセンス表記は [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md) を参照してください。

> bridgey は独立した**非公式**プロジェクトで、jQuery / Svelte / Vue の各プロジェクト・団体とは提携・後援・承認の関係にありません。jQuery の**書き味に着想**を得ていますが、jQuery のコードは含まず、APIを独自に再実装したものです。各名称は権利者の商標です。
