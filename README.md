# Hermes Agent Dashboard

Nous Research「Hermes Agent」の Web ダッシュボードを再現・拡張した UI モック。

## デモ

`index.html` をブラウザで開くだけで動作します（ビルド不要・外部依存は Google Fonts のみ）。

GitHub Pages: https://hiroshi57.github.io/hermes_agent_dashboard/

## 構成

```
hermes_agent_dashboard/
├── index.html      ← ダッシュボード本体（単一ファイル完結）
├── README.md       ← このファイル
├── Next.tasks.md   ← 改善タスクリスト（外販レベルを目指す）
└── skills/         ← 開発用 Claude Code スキル置き場
```

## 主な機能（15ページ）

| グループ | ページ |
|---------|--------|
| 運用 | ステータス / セッション / Kanban / Cron |
| エージェント | プロファイル / Profile Builder / SOUL / メモリ / Skills / MCP接続 |
| 管理 | 設定 / シークレット / チャンネル / セキュリティ / チェックポイント |

### ハイライト

- **Kanban**: HTML5 ドラッグ&ドロップ + サブエージェントのライブログシミュレーション（`delegate_task` / `max_concurrent=3` / 待機キュー自動昇格）
- **Profile Builder**: 3ステップウィザード + ライブ YAML プレビュー（変更行ハイライト）
- **Hermes Teal テーマ**: ダークティール + クリームのデザインシステム（CSS変数）

## 技術仕様

- Vanilla JS（フレームワーク不使用）
- フォント: IBM Plex Sans JP + JetBrains Mono
- レスポンシブ（980px 以下でサイドバー縮小）
- アクセシビリティ: `:focus-visible` / `aria-label` / `prefers-reduced-motion` 対応
- ブラウザストレージ不使用（状態は JS 変数のみ）
