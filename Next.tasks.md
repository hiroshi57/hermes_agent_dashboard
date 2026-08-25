# Next.tasks.md — 外販レベルへの改善タスク

> **運用ルール**: このファイルは常にタスクを切らさない。タスクが完了したら `## 完了済み` へ移動し、
> 新しい改善タスクを必ず補充する。各タスクには優先度（P1=高 / P2=中 / P3=低）と完了条件を付ける。

---

## 進行中

（なし）

---

## 未着手

### P1: セキュリティ・信頼性

- [ ] **Vercel env の本番設定確認**（`OPENMYTHOS_BASE_URL` / `OPENMYTHOS_API_KEY`）
  - 未設定のままだと OpenMythos 連携が 500 を返す
  - Vercel Project Settings → Environment Variables で設定する

### P2: 機能拡張

- [ ] **PR #2 マージ → main へのリリース**
  - `feature/v2-full-rewrite` を main へマージ
  - 本番 URL https://hermesagentdashboard.vercel.app に反映
- [ ] **パフォーマンス計測**（Lighthouse 90点以上を維持）
  - 現状スコア未計測（build後の dist を対象に計測する）
- [ ] **OpenMythos デモページのリンクを index.html に追加**
  - `/openmythos-demo.html` は公開済みだがナビから辿れない

### P3: 磨き込み

- [ ] **README.md に PR #2 / OpenMythos 連携の説明を追記**
- [ ] **lh-v3.json / lighthouse-report*.json をリポジトリから削除**
  - 成果物ファイルが root に散らばっている → docs/ 以下に整理するか .gitignore に追加

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
- [x] 2026-06-12: Analytics ページ追加（7/30/90日切替、KPI×4、日次バーチャート、モデル別内訳、エージェント別テーブル）
- [x] 2026-06-12: Logs Viewer ページ追加（agent/errors/gateway 3ファイル、INFO/WARN/ERROR/DEBUG フィルタ、ライブテイルシミュレーション、ダウンロード）
- [x] 2026-06-12: Chat TUI ページ追加（ストリーミング応答・ツール呼び出しブロック・Thinkingブロック・プロファイル切替・会話エクスポート）
- [x] 2026-06-14: ページ数表記を実装の18ページに統一（OGP/Twitter meta・README 日英の見出し・タスクログの誤った採番を修正）
- [x] 2026-06-12: キーボードナビゲーション強化（j/k で前後ページ、g+キー で直接ジャンプ、/ で検索フォーカス、? でヘルプ）
- [x] 2026-06-12: OGP / favicon 追加（SVG favicon インライン、og:title/description/type、twitter:card）
- [x] 2026-06-12: E2E スモークテスト追加（Playwright 5シナリオ・24テスト: 全ページ遷移・Kanban D&D・Builder フロー・テーマ切替・Chat TUI）
- [x] 2026-06-12: i18n 対応（JA/EN トグルボタン、I18N オブジェクト 50キー、data-i18n 属性、applyLang()/t() ユーティリティ）
- [x] 2026-06-14: コマンドパレット（⌘K / Ctrl+K）追加 — 全ページ横断のあいまい検索、↑↓/Enter で遷移、Escape で閉じる。i18n のページタイトルとグループラベルを再利用。? ヘルプにも追記
- [x] 2026-06-14: コマンドパレットにアクション実行を追加 — ページ遷移に加え、言語切替・テーマ・Kanbanタスク追加・設定/会話エクスポート・セキュリティ監査を ⌘K から検索・実行可能に（cmd.* i18nキー、ページ/アクションでアイコン区別）
