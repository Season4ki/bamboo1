# MetingJS 使用ガイド（日本語）

## 🌟 概要
MetingJS は、APlayer と組み合わせて、音楽プラットフォーム（NetEase/QQ/Kugou など）の曲・プレイリスト・アルバムを簡単に埋め込める Web コンポーネントです。HTML に `<meting-js>` タグを書くだけで、スタイリッシュな音楽プレイヤーを設置できます。

- プレイヤー UI: APlayer
- データ取得: Meting API（サーバー側で各音楽サービスをラップ）
- 対応サービス: `netease`（网易云音乐）、`tencent`（QQ 音楽）、`kugou` ほか

---

## ✨ 主な機能
- 曲/プレイリスト/アルバム/検索結果の埋め込み表示
- 固定表示（画面下部にピン留め）に対応
- ランダム再生/ループ再生/自動再生/音量/テーマ色など多彩なオプション
- レスポンシブデザイン・モバイル対応

---

## 📦 導入方法

### 1) CDN（最も手軽）
`index.html` に以下を追加します。

```html
<!-- APlayer の CSS -->
<link rel="stylesheet" href="https://unpkg.com/aplayer/dist/APlayer.min.css" />
<!-- APlayer 本体 -->
<script src="https://unpkg.com/aplayer/dist/APlayer.min.js"></script>
<!-- MetingJS 本体 -->
<script src="https://unpkg.com/meting@2/dist/Meting.min.js"></script>
```

### 2) npm（Vite/ビルド環境）
```bash
npm i aplayer meting
```
その後、通常は CDN と同様に `index.html` で読み込むのが簡単です（CSS の取り回しや Web Components の都合上）。

---

## 🚀 基本の使い方
`<meting-js>` タグを置くだけでプレイヤーが表示されます。

```html
<!-- 単曲を埋め込み（NetEase の例） -->
<meting-js
  server="netease"
  type="song"
  id="123456789"
></meting-js>
```

ID は各サービスの URL から取得できます（例: NetEase の楽曲 URL `.../song?id=123456789` の数字部分）。

---

## 🔧 よく使う属性一覧（抜粋）
- `server`: 音楽サービス（`netease` | `tencent` | `kugou` ...）
- `type`: 種別（`song` | `playlist` | `album` | `search`）
- `id`: 対象 ID（曲ID/プレイリストID/アルバムID など）
- `fixed`: 画面下部に固定（`true`/`false`）
- `autoplay`: 自動再生（`true`/`false`）※ブラウザポリシーにより無効化される場合あり
- `theme`: テーマ色（例: `#42a5f5`）
- `loop`: ループ（`all` | `one` | `none`）
- `order`: 再生順（`list` | `random`）
- `preload`: 事前読み込み（`none` | `metadata` | `auto`）
- `volume`: 初期音量（0.0〜1.0）
- `mutex`: 複数プレイヤーの同時再生を抑止（`true`/`false`）
- `list-folded`: 再生リストを折りたたみ（`true`/`false`）
- `lrc-type`: 歌詞（`0`=なし, `1`=URL, `3`=内包）
- `api`: Meting API のエンドポイントを独自指定（例: `https://api.i-meto.com/meting/api`）

---

## 📚 使用例

### A. 単曲・プレイリスト・アルバム
```html
<!-- 単曲 -->
<meting-js server="netease" type="song" id="123456789"></meting-js>

<!-- プレイリスト -->
<meting-js server="tencent" type="playlist" id="87654321"></meting-js>

<!-- アルバム -->
<meting-js server="netease" type="album" id="1357924680"></meting-js>
```

### B. 画面下部に固定、オプション指定
```html
<meting-js
  server="netease"
  type="playlist"
  id="745682130"
  fixed="true"
  autoplay="false"
  order="random"
  loop="all"
  preload="auto"
  volume="0.8"
  mutex="true"
  list-folded="true"
  theme="#42a5f5"
></meting-js>
```

### C. 検索結果から表示
```html
<meting-js
  server="netease"
  type="search"
  id="YOASOBI"
></meting-js>
```

---

## 🧩 Vue（Vite）での注意点（Web Components）
`<meting-js>` はカスタム要素です。Vue 3 のテンプレートで使う場合、未登録コンポーネント警告を避けたいときは、`vite.config.js` に以下の設定を追加します。

```js
// vite.config.js（一例）
import vue from '@vitejs/plugin-vue'

export default {
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'meting-js',
        },
      },
    }),
  ],
}
```

最も簡単なのは、`index.html` で CDN を読み込み、Vue の外側（静的 HTML）に `<meting-js>` を配置する方法です。Vue 内で使う場合も動作しますが、上記の設定をおすすめします。

---

## 🔐 自動再生とブラウザポリシー
近年のブラウザはユーザー操作なしの自動再生を制限しています。
- `autoplay="true"` を指定しても無音/再生待機になる場合があります
- 初回はユーザーのクリックやタップ後に再生開始されるのが一般的です
- モバイルではより厳格です

---

## 🌐 CORS / API について
- MetingJS は外部 API を呼び出して楽曲情報を取得します
- 開発環境で CORS により失敗する場合は、`api` 属性で安定したエンドポイントを指定するか、自前のプロキシを用意してください
- 公開 API はレート制限や停止のリスクがあるため、安定運用では自己ホストの Meting API を推奨します

---

## 🔎 トラブルシューティング
1. 再生できない / 曲が取得できない
   - ID/サーバー（`server`）の指定を再確認
   - 対象プラットフォームの地域制限（QQ 音楽など）に注意
   - CORS/ネットワークエラーを確認

2. 自動再生されない
   - ブラウザの自動再生ポリシーの仕様です。ユーザー操作後に再生してください

3. Vue テンプレートで警告が出る
   - `isCustomElement` 設定を追加

4. リストが長くてはみ出す
   - `list-folded="true"` を使い、必要に応じて APlayer の CSS を調整

---

## 📄 参考リンク
- APlayer: https://aplayer.js.org/
- MetingJS: https://github.com/metowolf/MetingJS
- Meting（サーバー）: https://github.com/metowolf/Meting

---

快適な音楽体験をお楽しみください！🎵
