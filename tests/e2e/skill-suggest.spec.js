// @ts-check
// 型付きスキル提案 (typed-decision-layer /api/skill_suggest) の組み込みテスト
//   API は page.route でモックする (実 API・API キーは使わない)
const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '../../index.html');
const ENDPOINT = 'https://skill-suggest.test/api/skill_suggest';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function openBuilder(page, config) {
  await page.goto(FILE_URL);
  await page.waitForFunction(() => typeof window.navigate === 'function');
  if (config) await page.evaluate(c => Object.assign(window.SKILL_SUGGEST_CONFIG, c), config);
  await page.evaluate(() => window.navigate('builder'));
  await page.waitForTimeout(300);
}

/** @param {import('@playwright/test').Page} page */
async function mockApi(page, status, body, { delayMs = 0 } = {}) {
  const requests = [];
  await page.route(ENDPOINT, async route => {
    const req = route.request();
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    requests.push(req.postDataJSON());
    if (delayMs) await new Promise(r => setTimeout(r, delayMs));
    try {
      await route.fulfill({ status, headers: { ...CORS, 'Content-Type': 'application/json' },
                            body: JSON.stringify(body) });
    } catch { /* abort 済み */ }
  });
  return requests;
}

async function recommend(page, goal) {
  await page.locator('#builder-goal').fill(goal);
  await page.locator('button:has-text("AIが推薦する")').click();
  await expect(page.locator('.toast').last()).toContainText('推薦完了');
  return page.evaluate(() => ({ ...state.builderData }));
}

async function ruleOnly(page, goal) {
  return page.evaluate(g => window.ruleBasedRecommendations(g.toLowerCase()), goal);
}

test.describe('型付きスキル提案', () => {
  test('endpoint 未設定なら API を呼ばずルール推薦', async ({ page }) => {
    await openBuilder(page);
    const requests = await mockApi(page, 200, {});
    const d = await recommend(page, 'PRレビューと CI 修復を自動化したい');
    expect(requests).toHaveLength(0);
    expect(d.recommendationSource).toBe('rule');
    expect(d.skills).toEqual((await ruleOnly(page, 'PRレビューと CI 修復を自動化したい')).skills);
  });

  test('API の提案を採用し、未知の skill id は捨てる', async ({ page }) => {
    await openBuilder(page, { endpoint: ENDPOINT });
    const requests = await mockApi(page, 200, {
      fallback: false, suggested: ['notion', 'github-issues', 'evil-skill'], multi_agent: 0.9,
    });
    const d = await recommend(page, '要件を Notion にまとめて Issue を起票する');

    expect(requests).toHaveLength(1);
    expect(requests[0].goal).toBe('要件を Notion にまとめて Issue を起票する');
    expect(requests[0].skills.map(s => s.id)).toContain('web-research');
    expect(Object.keys(requests[0].skills[0]).sort()).toEqual(['desc', 'id']);

    expect(d.recommendationSource).toBe('typed');
    expect(d.agentType).toBe('multi');
    expect(d.skills).toEqual(['notion', 'github-issues', 'kanban-orchestrator', 'kanban-worker']);
    await expect(page.locator('.toast').last()).toContainText('AI判定');
  });

  test('multi_agent が低ければシングル', async ({ page }) => {
    await openBuilder(page, { endpoint: ENDPOINT });
    await mockApi(page, 200, { fallback: false, suggested: ['notion'], multi_agent: 0.1 });
    const d = await recommend(page, '並列で複数の調査を回したい');   // ルールなら multi になる文
    expect(d.agentType).toBe('single');
    expect(d.skills).toEqual(['notion']);
  });

  for (const [name, status, body] of [
    ['503 (キー未設定)', 503, { error: 'backend_unavailable', fallback: true }],
    ['200 だが fallback=true', 200, { fallback: true, suggested: ['notion'] }],
    ['全候補却下 (suggested が空)', 200, { fallback: false, suggested: [], multi_agent: 0.2 }],
    ['不正な形', 200, { fallback: false, suggested: 'notion' }],
  ]) {
    test(`フォールバック: ${name}`, async ({ page }) => {
      await openBuilder(page, { endpoint: ENDPOINT });
      await mockApi(page, status, body);
      const goal = '競合他社の価格をモニタリングして週次でレポートしたい';
      const d = await recommend(page, goal);
      const rule = await ruleOnly(page, goal);
      expect(d.recommendationSource).toBe('rule');
      expect(d.skills).toEqual(rule.skills);
      expect(d.mcps).toEqual(rule.mcps);
      await expect(page.locator('.toast').last()).toContainText('ルール推薦');
    });
  }

  test('フォールバック: タイムアウト', async ({ page }) => {
    await openBuilder(page, { endpoint: ENDPOINT, timeoutMs: 300 });
    await mockApi(page, 200, { fallback: false, suggested: ['notion'] }, { delayMs: 3000 });
    const d = await recommend(page, 'Notion のページを整理したい');
    expect(d.recommendationSource).toBe('rule');
  });
});
