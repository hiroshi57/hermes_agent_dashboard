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
└── skills/         ← 開発用 Claude Code スキル置き場
```

## 主な機能（20ページ）

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
- **コマンドパレット**: `⌘K` で全ページを横断検索 → `↑`/`↓`・`Enter` で遷移（i18n 対応）

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
