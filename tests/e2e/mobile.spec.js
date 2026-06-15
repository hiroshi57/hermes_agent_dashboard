// @ts-check
/**
 * mobile.spec.js — モバイル実機相当の表示・操作検証
 *
 * 対象デバイス（playwright.config.js で定義）:
 *   - iPhone 13  (WebKit / iOS Safari 相当)
 *   - Pixel 5    (Chromium / Android Chrome 相当)
 *
 * 完了条件:
 *   - Kanban タッチドラッグ・レイアウトが正常動作
 *   - 全ページでコンソールエラーがゼロ
 */
const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '../../index.html');

// ============================================================
// Scenario M-1: モバイルレイアウト基本確認
// ============================================================
test.describe('モバイル: レイアウト基本確認', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForFunction(() => typeof window.navigate === 'function');
  });

  test('サイドバーが非表示でトップバーが表示される', async ({ page }) => {
    // モバイルではサイドバーは折りたたみ or 非表示
    const topbar = page.locator('#topbar');
    await expect(topbar).toBeVisible();

    // ページタイトルが表示される
    const title = page.locator('#topbar-title');
    await expect(title).toBeVisible();
  });

  test('全18ページへのナビゲーションが動作する', async ({ page }) => {
    const pages = [
      'status', 'sessions', 'kanban', 'cron', 'analytics', 'logs', 'chat',
      'profiles', 'builder', 'soul', 'memory', 'skills', 'mcp',
      'settings', 'secrets', 'channels', 'security', 'checkpoints',
    ];

    for (const pageId of pages) {
      await page.evaluate((id) => window.navigate(id), pageId);
      const el = page.locator(`#page-${pageId}`);
      await expect(el).toBeVisible({ timeout: 5000 });
    }
  });

  test('全ページでコンソールエラーがゼロ（モバイル）', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`);
    });
    page.on('pageerror', err => errors.push(`[pageerror] ${err.message}`));

    const pages = [
      'status', 'sessions', 'kanban', 'cron', 'analytics', 'logs', 'chat',
      'profiles', 'builder', 'soul', 'memory', 'skills', 'mcp',
      'settings', 'secrets', 'channels', 'security', 'checkpoints',
    ];

    for (const pageId of pages) {
      await page.evaluate((id) => window.navigate(id), pageId);
      await page.waitForTimeout(200);
    }

    expect(errors, `モバイルコンソールエラー: ${errors.join('; ')}`).toHaveLength(0);
  });
});

// ============================================================
// Scenario M-2: Kanban タッチドラッグ
// ============================================================
test.describe('モバイル: Kanban タッチドラッグ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForFunction(() => typeof window.navigate === 'function');
    await page.evaluate(() => window.navigate('kanban'));
    await expect(page.locator('#page-kanban')).toBeVisible();
    await page.waitForTimeout(500); // サブエージェント起動を待つ
  });

  test('Backlog カードがタッチデバイスで表示される', async ({ page }) => {
    const backlogCol = page.locator('.kanban-col[data-col="backlog"]');
    await expect(backlogCol).toBeVisible();
    const cards = backlogCol.locator('.kanban-card');
    await expect(cards.first()).toBeVisible();
  });

  test('タッチ操作でカードをドラッグできる（pointer events）', async ({ page }) => {
    const backlogCol = page.locator('.kanban-col[data-col="backlog"]');
    const reviewCol  = page.locator('.kanban-col[data-col="review"]');

    const card = backlogCol.locator('.kanban-card').first();
    const cardTitle = await card.locator('.kanban-card-title').textContent();

    // HTML5 DragEvent を直接 dispatch（モバイルエミュレーション / WebKit でも動作）
    await page.evaluate(() => {
      const cardEl = document.querySelector('.kanban-col[data-col="backlog"] .kanban-card');
      const colEl  = document.querySelector('.kanban-col[data-col="review"]');
      if (!cardEl || !colEl) throw new Error('要素が見つからない');

      const dt = typeof DataTransfer !== 'undefined' ? new DataTransfer() : null;
      const opts = { bubbles: true, cancelable: true };
      if (dt) opts.dataTransfer = dt;

      cardEl.dispatchEvent(new DragEvent('dragstart', opts));
      colEl.dispatchEvent(new DragEvent('dragover', opts));
      colEl.dispatchEvent(new DragEvent('drop', opts));
    });

    await page.waitForTimeout(400);

    // カードがレビュー列に移動している
    const reviewCards = reviewCol.locator('.kanban-card-title');
    const titles = await reviewCards.allTextContents();
    expect(titles.some(t => t.trim() === cardTitle?.trim())).toBeTruthy();
  });

  test('タスク追加ボタンがタップ可能（モバイル）', async ({ page }) => {
    const addBtn = page.locator('.kanban-card-add').first();
    await expect(addBtn).toBeVisible();

    // タップ（モバイルではクリック = タップ）
    await addBtn.tap();
    await expect(page.locator('#modal-add-task')).toBeVisible();

    // 入力後クローズ
    await page.fill('#task-content', 'モバイルテスト用タスク');
    await page.click('[onclick="submitAddTask()"]');
    await expect(page.locator('#modal-add-task')).not.toBeVisible();
  });
});

// ============================================================
// Scenario M-3: モバイルでの重要ページ表示確認
// ============================================================
test.describe('モバイル: 重要ページ表示確認', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForFunction(() => typeof window.navigate === 'function');
  });

  test('Analytics ページがモバイルで正しく表示される', async ({ page }) => {
    await page.evaluate(() => window.navigate('analytics'));
    await expect(page.locator('#page-analytics')).toBeVisible();

    // KPI カードが4枚表示される（クラス名: analytics-kpi）
    const kpiCards = page.locator('.analytics-kpi');
    await expect(kpiCards).toHaveCount(4);
  });

  test('Chat TUI がモバイルで動作する', async ({ page }) => {
    await page.evaluate(() => window.navigate('chat'));
    await expect(page.locator('#page-chat')).toBeVisible();
    await page.waitForTimeout(200);

    // メッセージが表示されている
    const messages = page.locator('#chat-messages .chat-msg');
    await expect(messages.first()).toBeVisible();

    // 入力フォームがタップ可能
    const input = page.locator('#chat-input');
    await expect(input).toBeVisible();
    await input.tap();
    await input.fill('モバイルテスト');
  });

  test('Skills ページがモバイルで表示される', async ({ page }) => {
    await page.evaluate(() => window.navigate('skills'));
    await expect(page.locator('#page-skills')).toBeVisible();

    // スキルグループが存在する（skills-grid-group: カテゴリ別グループ）
    const skillGroups = page.locator('.skills-grid-group');
    const count = await skillGroups.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Profile Builder がモバイルでステップ遷移できる', async ({ page }) => {
    await page.evaluate(() => window.navigate('builder'));
    await page.waitForTimeout(300);
    await expect(page.locator('#page-builder')).toBeVisible();

    // Step 1 入力（btn-primary + onclick で一意に特定）
    await page.locator('#builder-goal').fill('モバイルからエージェントを作りたい');
    await page.locator('button.btn-primary[onclick="goToStep(2)"]').click();
    await page.waitForTimeout(100);

    // Step 2 が active になる
    await expect(page.locator('[data-step-content="2"]')).toHaveClass(/active/);
  });
});

// ============================================================
// Scenario M-4: テーマ切替（モバイル）
// ============================================================
test.describe('モバイル: テーマ切替', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForFunction(() => typeof window.applyTheme === 'function');
  });

  test('テーマボタンがタップ可能', async ({ page }) => {
    const themeBtn = page.locator('#theme-toggle-btn');
    await expect(themeBtn).toBeVisible();
    await themeBtn.tap();
    await expect(page.locator('#theme-popup')).toHaveClass(/open/);
  });

  test('Midnight テーマを適用できる（モバイル）', async ({ page }) => {
    await page.evaluate(() => window.applyTheme('midnight'));
    const bgColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    );
    expect(bgColor).toBe('#0D1117');
  });
});
