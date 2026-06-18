# OpenMythos 連携

Hermes Agent Dashboard から [OpenMythos](https://github.com/hiroshi57/OpenMythos) の
マーケ系 API(広告コピー生成 / LLMO ダッシュボード / A/B テスト)を呼び出すための連携層です。

## アーキテクチャ

```
ブラウザ (静的ダッシュボード)
   │  fetch('/api/openmythos?path=/v1/...')
   ▼
/api/openmythos  (Vercel Serverless Function = プロキシ)
   │  Authorization: Bearer <OPENMYTHOS_API_KEY>  をサーバー側で付与
   ▼
OpenMythos サーバー (/v1/campaign, /v1/llmo, /v1/abtest, /v1/analytics)
```

ブラウザから OpenMythos を直接叩かない理由:
- **API キーを隠す**: キーはサーバー側 env にのみ置き、ブラウザに露出させない。
- **CORS 回避**: 同一オリジン(`/api/...`)経由にする。
- **SSRF 防止**: プロキシは `/v1/campaign` `/v1/abtest` `/v1/llmo` `/v1/analytics` のみ許可。

## ファイル

| ファイル | 役割 |
|---------|------|
| `api/openmythos.js` | Vercel Serverless プロキシ(allow-list + 鍵注入) |
| `assets/openmythos-client.js` | 依存ゼロのブラウザクライアント(`OpenMythosClient`) |
| `openmythos-demo.html` | 連携の動作デモ(コピー生成 / LLMO KPI) |
| `tests/e2e/openmythos.spec.js` | allow-list 単体 + デモページ E2E(プロキシをモック) |

## 環境変数 (Vercel Project Settings → Environment Variables)

| 変数 | 例 | 説明 |
|------|-----|------|
| `OPENMYTHOS_BASE_URL` | `https://openmythos.example.com` | OpenMythos サーバーの URL(末尾スラッシュ不要) |
| `OPENMYTHOS_API_KEY` | `********` | OpenMythos 側 `API_KEY` と一致する Bearer トークン |

ローカル確認時は `vercel dev`(または任意の方法で `/api/openmythos` を動かす)で env を渡してください。

## 使い方(フロント)

```html
<script src="assets/openmythos-client.js"></script>
<script>
  const om = new OpenMythosClient();   // 既定で /api/openmythos を使用

  // 広告コピー生成 (POST /v1/campaign/workflow)
  const camp = await om.generateAdCopy({
    name: '夏キャンペーン',
    scenario: '敏感肌の30代向け SPF50 無香料',
    objective: 'awareness',
  });

  // LLMO ダッシュボード (GET /v1/llmo/dashboard/{brand})
  const dash = await om.getLLMODashboard('acme');

  // A/B テスト作成 (POST /v1/abtest/)
  const ab = await om.createABTest({
    name: 'コピー比較',
    variants: [{ name: 'A', content: '...' }, { name: 'B', content: '...' }],
  });
</script>
```

## メインダッシュボードへの組み込み

`index.html` の `DEMO DATA` セクション(`PROFILES_DATA` 等が定義されている箇所)を、
OpenMythos からの実データに差し替えることで Analytics ビューを実データ化できます。例:

```js
// 既存の固定 KPI を OpenMythos の LLMO ダッシュボードで置き換える
const om = new OpenMythosClient();
const dash = await om.getLLMODashboard('自社ブランド名');
// dash.mention_rate / citation_rate / reference_rate を analytics-kpi に流し込む
```

本番の `index.html` は単一ファイル + minify ビルド対象のため、まずは `openmythos-demo.html`
で挙動を確認してから組み込むことを推奨します。

## OpenMythos 側 API 対応表

| クライアントメソッド | OpenMythos エンドポイント |
|--------------------|--------------------------|
| `generateAdCopy()` | `POST /v1/campaign/workflow` |
| `getLLMODashboard()` / `getLLMOTrend()` | `GET /v1/llmo/dashboard/{brand}` `/trend` |
| `addLLMOSnapshot()` | `POST /v1/llmo/snapshot` |
| `createABTest()` / `getABReport()` | `POST /v1/abtest/` / `GET /v1/abtest/{id}/report` |
| `getCampaignKpis()` | `GET /v1/analytics/{id}/kpis` |

## テスト

```bash
npx playwright test --project=openmythos
```

allow-list ロジック(SSRF 防止)とデモページの描画(プロキシをモック)を検証します。
```
