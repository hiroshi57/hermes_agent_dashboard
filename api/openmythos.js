// api/openmythos.js — OpenMythos 連携プロキシ (Vercel Serverless Function)
//
// 役割:
//   ブラウザ(静的ダッシュボード) → /api/openmythos → OpenMythos サーバー
//   を中継する。OpenMythos の API キーをサーバー側 env に隠蔽し、CORS も回避する。
//
// 必要な環境変数 (Vercel Project Settings → Environment Variables):
//   OPENMYTHOS_BASE_URL  例: https://openmythos.example.com  (末尾スラッシュ不要)
//   OPENMYTHOS_API_KEY   OpenMythos 側 `API_KEY` と一致する Bearer トークン
//
// 呼び出し方 (フロント):
//   GET  /api/openmythos?path=/v1/llmo/dashboard/acme
//   POST /api/openmythos?path=/v1/campaign/workflow   (body は OpenMythos へそのまま転送)
//
// セキュリティ: 転送先パスは下記 ALLOW_PREFIXES に前方一致するもののみ許可する
// (SSRF / 任意エンドポイント呼び出しを防ぐ)。

const ALLOW_PREFIXES = [
  '/v1/campaign',   // CEP→コピー生成→評価 / キャンペーン CRUD
  '/v1/abtest',     // A/B テスト
  '/v1/llmo',       // LLMO ダッシュボード / トレンド / 競合
  '/v1/analytics',  // KPI / レポート
];

const ALLOW_METHODS = ['GET', 'POST'];

function isAllowedPath(rawPath) {
  if (typeof rawPath !== 'string') return false;

  // 二重URLエンコード (%252e%252e 等) を含むトラバーサルを防ぐため
  // decodeURIComponent を最大2回適用して正規化する
  let path = rawPath;
  try { path = decodeURIComponent(path); } catch { return false; }
  try { path = decodeURIComponent(path); } catch { /* 1回で十分 */ }

  // ドットセグメントを除去（/ で分割→ . / .. を解決→再結合）
  const segments = path.split('/').reduce((acc, seg) => {
    if (seg === '..') { acc.pop(); }
    else if (seg !== '.') { acc.push(seg); }
    return acc;
  }, []);
  const normalized = '/' + segments.filter(Boolean).join('/');

  if (!normalized.startsWith('/v1/')) return false;
  if (normalized.includes('..')) return false; // 念のため再チェック

  return ALLOW_PREFIXES.some(
    (p) => normalized === p || normalized.startsWith(p + '/') || normalized.startsWith(p)
  );
}

module.exports = async function handler(req, res) {
  const baseUrl = process.env.OPENMYTHOS_BASE_URL;
  const apiKey = process.env.OPENMYTHOS_API_KEY;

  if (!baseUrl) {
    res.status(500).json({ error: 'OPENMYTHOS_BASE_URL が未設定です (Vercel env を確認してください)' });
    return;
  }
  if (!ALLOW_METHODS.includes(req.method)) {
    res.status(405).json({ error: `Method ${req.method} は許可されていません` });
    return;
  }

  const rawPath = req.query && req.query.path;
  if (!isAllowedPath(rawPath)) {
    res.status(400).json({ error: `許可されていない path です: ${rawPath}`, allowed: ALLOW_PREFIXES });
    return;
  }

  // forward には正規化済みパスを使う（エンコード済み文字列をそのまま渡さない）
  let normalizedPath = rawPath;
  try { normalizedPath = decodeURIComponent(normalizedPath); } catch { /* ignore */ }
  try { normalizedPath = decodeURIComponent(normalizedPath); } catch { /* ignore */ }
  normalizedPath = '/' + normalizedPath.split('/').reduce((acc, seg) => {
    if (seg === '..') { acc.pop(); } else if (seg !== '.') { acc.push(seg); }
    return acc;
  }, []).filter(Boolean).join('/');

  const target = baseUrl.replace(/\/+$/, '') + normalizedPath;

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const init = { method: req.method, headers };
  if (req.method === 'POST') {
    // Vercel は JSON body をパース済み (req.body) のことが多いが、未パースにも対応
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    init.body = body;
  }

  try {
    const upstream = await fetch(target, init);
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    // 上流が JSON でない場合もそのまま返す
    res.send(text);
  } catch (err) {
    res.status(502).json({ error: 'OpenMythos への接続に失敗しました', detail: String(err) });
  }
};

// テスト用にエクスポート (Vercel ランタイムでは未使用)
module.exports.isAllowedPath = isAllowedPath;
module.exports.ALLOW_PREFIXES = ALLOW_PREFIXES;
