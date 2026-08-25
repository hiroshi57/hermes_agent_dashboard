---
name: project-openmythos
description: OpenMythos — open-source RDT LLM framework, Sprint 61 完了 v0.64.0, CI pending on PR #35
metadata:
  type: project
---

Python 製オープンソース LLM フレームワーク (Recurrent-Depth Transformer)。
127本の REST API エンドポイント、累計 ~3352 テスト PASS。

**現在の状態 (2026-06-12)**:
- Sprint 61 完了: Claude Fable 5 / Mythos 5 × N-day→N-hour サイバー防衛
- PR #35: feature/sprint61-fable5-mythos5-cyber → main (CI pending)
- バージョン: v0.64.0
- リポジトリ: https://github.com/hiroshi57/OpenMythos

**モデル体系**:
- Claude Fable 5 = `claude-sonnet-4-5` (一般向け)
- Claude Mythos 5 = `claude-opus-4` (サイバー防衛特化)

**Why:** Sprint 60(広告/A&B)+ Sprint 61(N-hour サイバー防衛) のコードは書かれていたが未コミット。テストは `mock_heavy_deps` fixture が torch をモックに差し替えて全114件失敗していた。torch 2.11.0+cpu / transformers 5.8.1 はインストール済みなのでフィクスチャ削除で解決。
**How to apply:** 次回セッション開始時は PR #35 の CI 状態を確認し、通過していれば main へマージを提案する。
