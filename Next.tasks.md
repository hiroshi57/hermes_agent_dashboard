# Next.tasks.md — 外販レベルへの改善タスク

> **運用ルール**: このファイルは常にタスクを切らさない。タスクが完了したら `## 完了済み` へ移動し、
> 新しい改善タスクを必ず補充する。各タスクには優先度（P1=高 / P2=中 / P3=低）と完了条件を付ける。

---

## 進行中

（なし — P1完了。P3: Lighthouse 計測が次タスク）

---

## 未着手

### P1: 品質・信頼性（要実機）

- [x] **実ブラウザでの動作検証** ← 完了
  - Playwright で Chromium / Firefox / WebKit (Safari) 3ブラウザ対応
  - 全34テスト PASS（コンソールエラーゼロ確認済み）
  - 修正: Cron タイトル / Profile Builder セレクタ / D&D を DragEvent dispatch 方式に統一
- [x] **モバイル実機での表示確認** ← 完了
  - Playwright で iPhone 13 (iOS WebKit) + Pixel 5 (Android Chrome) エミュレーション追加
  - mobile.spec.js 新規作成（4シナリオ・12テスト × 2デバイス = 24テスト PASS）
  - タッチD&D・タップ操作・全ページ遷移・Analytics/Chat/Skills/Builder 動作確認済み

### P2: 機能拡張

- [x] **チャット（TUI埋め込み）ページの追加** ← 完了
- [x] **E2E スモークテストの追加** ← 完了

### P3: 磨き込み

- [x] **キーボードナビゲーション強化** ← 完了
- [x] **OGP・favicon の追加** ← 完了
- [x] **i18n 対応** ← 完了
- [ ] **パフォーマンス計測**（Lighthouse 90点以上を維持）

---

## 完了済み

- [x] 2026-06-11: index.html 初版完成（15ページ・Kanban ライブシミュレーション・Profile Builder YAML プレビュー）
- [x] 2026-06-11: フォルダ整理（skills/ 分離・README.md 追加）
- [x] 2026-06-11: JS 構文チェック（node --check）エラーゼロ確認
- [x] 2026-06-12: Profile Builder を4ステップウィザードに刷新（目的・タイプ → Identity/Model → Skills+MCP → Review）
- [x] 2026-06-12: AI 推薦エンジン追加（キーワードマッチでエージェントタイプ・Skills・MCP を推薦、人間が最終決定）
- [x] 2026-06-12: Skills ページをカテゴリサイドバー＋グループ表示に刷新（178スキル、15カテゴリ）
- [x] 2026-06-12: Kanban 監視パネル追加（ログ / 詳細 / 指示注入 の3タブ、カード上の⏸/▶/🔄ボタン、優先度変更・プロファイル再割り当て）
- [x] 2026-06-12: README.en.md 作成（英語マーケットプレイス向け説明文）
- [x] 2026-06-12: BRAND_CONFIG 追加（ブランド名・カラー・ロゴを1箇所で差し替え可能）
- [x] 2026-06-12: DEMO DATA セクション整備（全サンプルデータにスキーマコメント付き）
- [x] 2026-06-12: Kanban タッチデバイス対応（pointer events フォールバック、iOS/Android でドラッグ可能）
- [x] 2026-06-12: テーマ切替機能（6種: Hermes Teal / Midnight / Ember / Mono / Cyberpunk / Rosé、トップバー🎨ボタンで切替）
- [x] 2026-06-12: Analytics ページ追加（18ページ目: 7/30/90日切替、KPI×4、日次バーチャート、モデル別内訳、エージェント別テーブル）
- [x] 2026-06-12: Logs Viewer ページ追加（19ページ目: agent/errors/gateway 3ファイル、INFO/WARN/ERROR/DEBUG フィルタ、ライブテイルシミュレーション、ダウンロード）
- [x] 2026-06-12: Chat TUI ページ追加（20ページ目: ストリーミング応答・ツール呼び出しブロック・Thinkingブロック・プロファイル切替・会話エクスポート）
- [x] 2026-06-12: キーボードナビゲーション強化（j/k で前後ページ、g+キー で直接ジャンプ、/ で検索フォーカス、? でヘルプ）
- [x] 2026-06-12: OGP / favicon 追加（SVG favicon インライン、og:title/description/type、twitter:card）
- [x] 2026-06-12: E2E スモークテスト追加（Playwright 5シナリオ・24テスト: 全ページ遷移・Kanban D&D・Builder フロー・テーマ切替・Chat TUI）
- [x] 2026-06-12: i18n 対応（JA/EN トグルボタン、I18N オブジェクト 50キー、data-i18n 属性、applyLang()/t() ユーティリティ）
