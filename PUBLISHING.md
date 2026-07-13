# npm への公開手順

bridgeway を npm に公開する手順です。公開すると `npm install bridgeway` と
`<script src="https://cdn.jsdelivr.net/npm/bridgeway/dist/bridge.vue.js">` の両方が使えるようになります。

## 0. 事前準備（初回のみ）

```bash
npm whoami            # 未ログインなら↓
npm login             # ブラウザ or トークンで認証
```

- npm アカウントが必要です（https://www.npmjs.com/signup）。
- 2要素認証(2FA)を有効にしている場合、公開時にワンタイムコードを聞かれます。

## 1. パッケージ名の空きを確認

`package.json` の `name` は現在 `bridgeway` です。**短い名前は既に取られていることが多い**ので確認します。

```bash
npm view bridgeway       # 404(E404) なら空き。情報が出たら使用中
```

使用中なら名前を変える必要があります。おすすめは**スコープ付き**（自分のユーザー名/組織名）:

```jsonc
// package.json
{ "name": "@yourname/bridgeway" }
```

> スコープ付きを **無料で公開** するには、後述の `--access public` が必須です。
> 併せて CLI 生成コードの import 名（`bin/bridge.js` の `PKG` 定数）も新しい名前に合わせてください。

## 2. 中身を確認（何が公開されるか）

`package.json` の `files` で `src` / `bin` / `dist` / `README.md` のみを公開する設定です。

```bash
npm run build         # dist/ を最新化（重要）
npm pack --dry-run    # 公開される正確なファイル一覧を表示（ここで過不足を確認）
```

- `dist/bridge.js` / `dist/bridge.vue.js` が含まれているか必ず確認（CDN配布物）。
- `node_modules` や `sample/` は含まれません（`files` で絞っているため）。

## 3. バージョンを決める

セマンティックバージョニング。初回は `1.0.0` のままでOK。以降は:

```bash
npm version patch     # 1.0.0 → 1.0.1 （バグ修正）
npm version minor     # 1.0.0 → 1.1.0 （後方互換の機能追加）
npm version major     # 1.0.0 → 2.0.0 （破壊的変更）
```

`npm version` は package.json を書き換え、git があればコミット＋タグも打ちます。

## 4. 公開

```bash
# 通常の名前
npm publish

# スコープ付き( @yourname/bridgeway )を無料公開する場合
npm publish --access public
```

公開直後に確認:

```bash
npm view bridgeway version
```

## 5. CDN（自動）

npm に公開されれば、jsDelivr / unpkg が**自動で**配信します（`package.json` の
`jsdelivr` / `unpkg` フィールドで既定ファイルを指定済み）。

```html
<script src="https://cdn.jsdelivr.net/npm/bridgeway@1/dist/bridge.vue.js"></script>
<!-- or -->
<script src="https://unpkg.com/bridgeway@1/dist/bridge.vue.js"></script>
```

## よくある詰まり

| 症状 | 対処 |
| --- | --- |
| `E403 Forbidden` / 名前が使用中 | 名前を変更（スコープ付き推奨） |
| スコープ付きで `E402`/権限エラー | `npm publish --access public` を付ける |
| `dist/` がCDNに無い | 公開前に `npm run build` を忘れている。`npm pack --dry-run` で確認 |
| 間違えて公開した | `npm unpublish bridgeway@1.0.1`（公開後72時間以内・制約あり）。基本は新バージョンで上書き |
| 公開を試したい | `npm publish --dry-run` で実際には送らず検証 |

## リリースの定番フロー（まとめ）

```bash
npm run build
npm pack --dry-run          # 中身確認
npm version patch           # バージョン上げ（＋git tag）
npm publish                 # (スコープ付きは --access public)
git push --follow-tags      # タグも push（gitを使っている場合）
```
