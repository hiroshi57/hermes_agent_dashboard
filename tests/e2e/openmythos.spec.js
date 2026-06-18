// @ts-check
// OpenMythos 連携テスト
//   1) プロキシの allow-list ロジック (SSRF 防止) を node レベルで検証
//   2) デモページが /api/openmythos をモックした状態で正しく描画されるか検証
const { test, expect } = require('@playwright/test');
const path = require('path');
const http = require('http');
const fs = require('fs');

const proxy = require('../../api/openmythos.js');

// ============================================================
// 1) プロキシ allow-list (セキュリティ)
// ============================================================
test.describe('openmythos プロキシ allow-list', () => {
  test('許可された v1 マーケ系パスは通す', () => {
    expect(proxy.isAllowedPath('/v1/campaign/workflow')).toBe(true);
    expect(proxy.isAllowedPath('/v1/llmo/dashboard/acme')).toBe(true);
    expect(proxy.isAllowedPath('/v1/abtest/')).toBe(true);
    expect(proxy.isAllowedPath('/v1/analytics/c1/kpis')).toBe(true);
  });

  test('許可外パス / トラバーサル / 非文字列は拒否', () => {
    expect(proxy.isAllowedPath('/v1/admin/keys')).toBe(false);
    expect(proxy.isAllowedPath('/v1/llmo/../admin')).toBe(false);
    expect(proxy.isAllowedPath('/etc/passwd')).toBe(false);
    expect(proxy.isAllowedPath('')).toBe(false);
    expect(proxy.isAllowedPath(undefined)).toBe(false);
    // @ts-expect-error 故意に型違反を渡す
    expect(proxy.isAllowedPath(123)).toBe(false);
  });
});

// ============================================================
// 2) デモページ (プロキシをモック)
// ============================================================
test.describe('OpenMythos 連携デモページ', () => {
  // Chromium は file:// からの fetch を禁止するため、http で配信する簡易サーバを使う
  let server;
  let baseURL;

  test.beforeAll(async () => {
    const root = path.resolve(__dirname, '../../');
    server = http.createServer((req, res) => {
      const rel = decodeURIComponent((req.url || '/').split('?')[0]);
      const filePath = path.join(root, rel);
      // ルート外アクセスを防ぐ
      if (!filePath.startsWith(root)) { res.statusCode = 403; res.end('forbidden'); return; }
      fs.readFile(filePath, (err, data) => {
        if (err) { res.statusCode = 404; res.end('not found'); return; }
        const ext = path.extname(filePath);
        const ct = ext === '.html' ? 'text/html' : ext === '.js' ? 'text/javascript' : 'text/plain';
        res.setHeader('Content-Type', ct);
        res.end(data);
      });
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseURL = `http://127.0.0.1:${server.address().port}`;
  });

  test.afterAll(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
  });

  test.beforeEach(async ({ page }) => {
    // /api/openmythos へのリクエストを path に応じてモック
    await page.route('**/api/openmythos**', async (route) => {
      const url = new URL(route.request().url());
      const p = url.searchParams.get('path') || '';
      let body;
      if (p.startsWith('/v1/campaign/workflow')) {
        body = {
          campaign_id: 'camp_test',
          name: '夏の日焼け止めキャンペーン',
          ad_copy: { headline: 'うるおい続く、無香料SPF50', body: '敏感肌にやさしい設計。' },
          evaluation: { score: 0.87 },
        };
      } else if (p.startsWith('/v1/llmo/dashboard/')) {
        body = { brand: 'acme', mention_rate: 0.42, citation_rate: 0.31, reference_rate: 0.18, snapshots: 12 };
      } else {
        body = { ok: true, path: p };
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
    await page.goto(`${baseURL}/openmythos-demo.html`);
    await page.waitForFunction(() => typeof window.OpenMythosClient === 'function');
  });

  test('広告コピー生成が結果を描画する', async ({ page }) => {
    await page.click('#ad-generate');
    await expect(page.locator('#ad-status')).toHaveText('生成しました');
    const result = page.locator('#ad-result');
    await expect(result).toBeVisible();
    await expect(result).toContainText('うるおい続く、無香料SPF50');
  });

  test('LLMO ダッシュボードの KPI を描画する', async ({ page }) => {
    await page.click('#llmo-load');
    await expect(page.locator('#llmo-status')).toHaveText('取得しました');
    const kpis = page.locator('#llmo-kpis');
    await expect(kpis).toBeVisible();
    // mention_rate 0.42 → 42.0% に整形される
    await expect(kpis).toContainText('mention_rate');
    await expect(kpis).toContainText('42.0%');
  });
});
