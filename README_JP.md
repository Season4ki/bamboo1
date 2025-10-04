# プロジェクト概要 (日本語版)

## 🌿 プロジェクト名
`bamboo1` – パーソナル / ポータル型インタラクティブホームページ

## 🧩 コア構成要素
| 機能 | コンポーネント / ファイル | 概要 |
|------|---------------------------|------|
| ルート UI / レイアウト | `App.vue` / `app.js` | 主要状態・時間表示・背景/音楽/天気統合 |
| 設定/右パネル | `homeseting.vue` | 背景やテーマ関連の操作（推測） |
| タイピング演出 | `typewriter.vue` | ウェルカム文言のタイプ表示 |
| タブ UI | `tabs/tab2.vue`, `tabs/tab3.vue` | 背景プレビュー・音楽再生切替 |
| レーダーチャート | `radarChart.vue` | プロフィール/スキル可視化（推測） |
| 歌詞ボックス | `LyricsBox.vue` | 再生中楽曲の歌詞同期表示 |
| ローディング | `PageLoading.vue` | 初期表示マスク/スピナー |
| 天気ウィジェット | `WeatherChart.vue` | OpenWeatherMap + Chart.js + Vuetify |
| 共通設定 | `config.js` | 背景・音楽プレイヤー設定・メタ情報 |
| 共通ユーティリティ | `utils/common.js` | 日時フォーマット / Metaタグ設定 / コンソール出力 |
| Cookie 操作 | `utils/cookieUtils.js` | ユーザー設定保持 |

## 🔑 中心ロジック（`app.js`）
- 起動時: `mounted()` 内で
  - `VITE_CONFIG` の上書き取り込み
  - 画像/動画背景プリロード（2.5s タイムアウト付き）
  - 時刻 (`setInterval` で 1s 更新)
  - メタタグ設定 (`setMeta`)
  - 背景とテーマ CSS カスタムプロパティを Cookie またはデフォルトから適用
  - 音楽メタデータ取得 (`getMusicInfo` → 外部 Meting API)
  - ネイティブ `<audio>` / APlayer の二重管理構造確立

- 音楽プレイヤー制御
  - `useAPlayer` フラグにより APlayer / ネイティブ切り替え
  - 再生・前後スキップ時にインデックス同期 (`playlistIndex`)
  - 歌詞: APlayer の LRC DOM / オブジェクトをポーリングし `currentLyrics` を更新
  - `syncTimer` / `lyricsTimer` で状態・歌詞を定期同期

- 背景切替ロジック
  - Cookie: `bamboo1databackground` / `bamboo1data` から動的に CSS 変数適用
  - モバイル判定: `useDisplay().xs`
  - 動画 / 静止画の条件分岐

- 状態カテゴリ
  - 表示制御: `isloading`, `isAppBootLoading`, `isClearScreen`
  - メディア: `videosrc`, `ismusicplayer`, `isPlaying`, `playlistIndex`
  - 音楽データ: `musicinfo`, `lyrics`, `currentPlayTime`
  - インターフェース: `tabs`, `projectcards`

## ☁️ 天気モジュール（`WeatherChart.vue`）要点
- OpenWeatherMap API + 日本語 (`lang=ja`)
- デフォルト都市: 東京 / GPS 取得で動的切替
- 30分間隔自動更新 + 手動更新 + 再試行
- 24時間（3時間刻み）折れ線グラフ (温度/湿度)
- 5日間日次集計（今日 / 曜日表記）
- API キー無効時はモックデータフェイルオーバー
- ダブルクリック or ボタンで詳細展開

## 🎧 音楽プレイヤー統合
- 外部 API: `https://api.i-meto.com/meting/api` から JSON 曲リスト取得
- APlayer 利用時:
  - ネイティブ `<audio>` と排他
  - `skipForward/skipBack` でトラック移動
  - 歌詞 DOM 監視 → 現行行抽出
- フォールバック: APlayer 不使用時はネイティブで再生管理

## 🗂 設計スタイル
- 分離: データ取得 (fetch) / UI 状態 / DOM 同期（APlayer 依存部）
- レイアウト: Vuetify の `useDisplay()` でレスポンシブ分岐
- カスタマイズ: CSS カスタムプロパティでテーマ/背景一括適用
- 回復力: 天気/音楽 API エラー時の graceful degrade（モック or ログ）

## 🔐 永続化とセッション
| 項目 | 手段 | 用途 |
|------|------|------|
| 色 / ぼかし / 輝度 | Cookie (`bamboo1data`) | UI テーマ継続 |
| 背景設定 | Cookie (`bamboo1databackground`) | デバイス別背景保持 |
| 音楽 / 天気データ | メモリのみ | 即時取得 / 非永続 |

## 🧪 改善余地
- APlayer 歌詞同期: MutationObserver で効率化
- 背景/設定ストレージを localStorage 化（有効期限制御）
- API キーを環境変数へ分離 (`import.meta.env`)
- 型安全化（TypeScript 導入）
- `musicinfo` / `weatherData` キャッシュ層導入

## 📄 開発コマンド（推測）
```bash
npm install
npm run dev
npm run build
```

## 🛡 エラーハンドリング指針
| ケース | 現状 | 推奨拡張 |
|--------|------|----------|
| 天気 API 401 | モック表示 | UI にキー設定導線 |
| 位置情報拒否 | 日本語メッセージ | 再試行ボタン追加 |
| 音楽 API 失敗 | コンソールログ | UI トースト通知 |
| 背景読み込み失敗 | タイムアウト | フォールバック背景 |

## ✅ サマリー
このサイトは「個人ダッシュボード型 UI + 視覚演出 + 音楽 + 天気」という統合体。`app.js` がオーケストレーターとして各機能（背景・時間・音楽・歌詞・UI 状態）を束ね、`WeatherChart.vue` が自己完結的に気象ビジュアルを提供。APlayer 統合によりメディア体験が拡張され、Cookie ベースの軽量なユーザー設定保持でパーソナライズを実現しています。

---
英語版ドキュメントは `README.md` を参照してください。
