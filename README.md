# Hermes Agent Dashboard

Nous Research「Hermes Agent」の Web ダッシュボードを再現・拡張した UI モック。

## デモ

`index.html` をブラウザで開くだけで動作します（ビルド不要・外部依存は Google Fonts のみ）。

GitHub Pages: https://hiroshi57.github.io/hermes_agent_dashboard/  
Vercel: https://hermes-agent-dashboard.vercel.app/

## 構成

```
hermes_agent_dashboard/
├── index.html      ← ダッシュボード本体（単一ファイル完結・約300KB）
├── README.md       ← このファイル
├── README.en.md    ← 英語版ドキュメント（マーケットプレイス向け）
├── Next.tasks.md   ← 改善タスクリスト（外販レベルを目指す）
├── package.json    ← E2E テスト用（Playwright）
├── tests/          ← E2E スモークテスト
├── docs/
│   └── QA_CHECKLIST.md  ← 実ブラウザ／実機の動作検証チェックリスト
└── skills/         ← 開発用 Claude Code スキル置き場
```

## 主な機能（18ページ）

| グループ | ページ |
|---------|--------|
| 運用 | ステータス / セッション / Kanban / Cron / Analytics / Logs Viewer |
| エージェント | プロファイル / Profile Builder / SOUL / メモリ / Skills / MCP接続 / Chat |
| 管理 | 設定 / シークレット / チャンネル / セキュリティ / チェックポイント |

### ハイライト

- **Kanban**: HTML5 ドラッグ&ドロップ + タッチ対応（Pointer Events）+ サブエージェントのライブログシミュレーション
  - 監視パネル: ログ / 詳細 / 指示注入 の3タブ
  - カード操作: ⏸停止 / ▶再開 / 🔄再起動 + 優先度変更・プロファイル再割り当て
- **Profile Builder**: 4ステップウィザード + AI推薦エンジン + ライブ YAML プレビュー
- **Chat TUI**: ストリーミング応答・ツール呼び出しブロック・Thinkingブロック・プロファイル切替
- **Analytics**: 7/30/90日切替、KPI×4、日次バーチャート、モデル別内訳
- **Logs Viewer**: ライブテイルシミュレーション、3ファイル切替、INFOレベルフィルタ、ダウンロード
- **テーマ切替**: 6種（Hermes Teal / Midnight / Ember / Mono / Cyberpunk / Rosé）
- **i18n**: JA / EN トグル（`data-i18n` + `I18N` オブジェクト 50キー）
- **キーボードナビ**: `⌘K`/`Ctrl+K` コマンドパレット・`j`/`k` 前後ページ・`g+キー` 直接ジャンプ・`/` 検索・`?` ヘルプ
- **コマンドパレット**: `⌘K` で全ページ＋主要アクション（言語切替・テーマ・タスク追加・各種エクスポート等）を横断検索 → `↑`/`↓`・`Enter` で実行（i18n 対応）

## カスタマイズ

### ブランド設定（`BRAND_CONFIG`）

`index.html` の `<script>` 冒頭にある `BRAND_CONFIG` を編集するだけで全体のブランドが変わります:

```js
const BRAND_CONFIG = {
  name: 'Hermes Agent',
  tagline: 'v0.9 · multi-agent runtime',
  accentColor: '#2DD4BF',
  logoLetter: 'H',
};
```

### デモデータ（`DEMO_DATA`）

サンプルデータはすべて `DEMO_DATA` セクションにまとまっています。
スキーマコメント付きで自分のデータへの差し替えが容易です。

### AI スキル推薦（`SKILL_SUGGEST_CONFIG`）

Profile Builder の「AIが推薦する」は、既定では目的文のキーワード（`REC_RULES`）で推薦する。
スキル提案 API（別リポジトリ・Private の typed-decision-layer）を設定すると、LLM による
型付き判断（全件ランク → 上位候補を1件ずつ適合判定）でスキルとエージェント種別を推薦する。

```js
// index.html 内、または読み込み前に window.SKILL_SUGGEST_CONFIG を定義して上書き
window.SKILL_SUGGEST_CONFIG = {
  endpoint: 'https://<API をデプロイした URL>/api/skill_suggest',  // 空なら API を呼ばない
  timeoutMs: 8000,
};
```

- API の失敗・タイムアウト・不正な応答・全候補却下のときは、自動でルール推薦に戻る（トーストに「ルール推薦」と出る）。
- 応答の skill id は `BUILDER_SKILLS` にあるものだけを採用する。MCP の推薦は従来どおりルールで行う。
- endpoint を設定すると、入力した目的文とスキル一覧（id・説明）が API 経由で LLM に送られる。機密情報を目的文に書かないこと。

## 技術仕様

- **Vanilla JS** — フレームワーク不使用・ビルド不要
- **フォント**: IBM Plex Sans JP + JetBrains Mono（Google Fonts）
- **レスポンシブ**: 980px 以下でサイドバー縮小
- **アクセシビリティ**: `:focus-visible` / `aria-label` / `prefers-reduced-motion`
- **XSS 対策**: 全動的レンダリングは DOM API（`createElement`/`textContent`）使用
- **ブラウザストレージ不使用**: 状態は JS 変数のみ（Cookie・localStorage ゼロ）

## E2E テスト（Playwright）

```bash
npm install
npx playwright install
npm test
```

5シナリオ・24テスト: 全ページ遷移 / Kanban D&D / Profile Builder フロー / テーマ切替 / Chat TUI
