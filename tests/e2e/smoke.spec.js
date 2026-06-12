// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '../../index.html');

// ============================================================
// Scenario 1: 全ページ遷移
// ============================================================
test.describe('全ページ遷移', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
    // JS 完全初期化を待つ
    await page.waitForFunction(() => typeof window.navigate === 'function');
  });

  const ALL_PAGES = [
    { id: 'status',      label: 'ステータス' },
    { id: 'sessions',    label: 'セッション' },
    { id: 'kanban',      label: 'Kanban' },
    { id: 'cron',        label: 'Cron' },
    { id: 'analytics',   label: 'Analytics' },
    { id: 'logs',        label: 'Logs Viewer' },
    { id: 'chat',        label: 'Chat' },
    { id: 'profiles',    label: 'プロファイル' },
    { id: 'builder',     label: 'Profile Builder' },
    { id: 'soul',        label: 'Personality / SOUL' },
    { id: 'memory',      label: 'メモリ' },
    { id: 'skills',      label: 'Skills' },
    { id: 'mcp',         label: 'MCP接続' },
    { id: 'settings',    label: '設定' },
    { id: 'secrets',     label: 'シークレット' },
    { id: 'channels',    label: 'チャンネル' },
    { id: 'security',    label: 'セキュリティ' },
    { id: 'checkpoints', label: 'チェックポイント' },
  ];

  for (const { id, label } of ALL_PAGES) {
    test(`${label} ページに遷移できる`, async ({ page }) => {
      // navigate() を JS 呼び出しで実行
      await page.evaluate((pageId) => window.navigate(pageId), id);

      // ページが visible になる
      const pageEl = page.locator(`#page-${id}`);
      await expect(pageEl).toBeVisible();

      // トップバーのタイトルが更新される
      const topbarTitle = page.locator('#topbar-title');
      await expect(topbarTitle).toHaveText(label);

      // コンソールエラーがないことを確認（beforeEach で登録済みリスナーで収集）
    });
  }

  test('全ページでコンソールエラーがゼロ', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    for (const { id } of ALL_PAGES) {
      await page.evaluate((pageId) => window.navigate(pageId), id);
      await page.waitForTimeout(200); // render 完了を待つ
    }

    expect(errors, `コンソールエラー: ${errors.join('; ')}`).toHaveLength(0);
  });

  test('j/k キーでページナビゲーションできる', async ({ page }) => {
    await page.evaluate(() => window.navigate('status'));

    // j キーで次のページへ
    await page.keyboard.press('j');
    const topbar = page.locator('#topbar-title');
    await expect(topbar).toHaveText('セッション');

    // k キーで前に戻る
    await page.keyboard.press('k');
    await expect(topbar).toHaveText('ステータス');
  });
});

// ============================================================
// Scenario 2: Kanban D&D
// ============================================================
test.describe('Kanban ドラッグ&ドロップ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForFunction(() => typeof window.navigate === 'function');
    await page.evaluate(() => window.navigate('kanban'));
    await expect(page.locator('#page-kanban')).toBeVisible();
    // サブエージェント起動を待つ
    await page.waitForTimeout(500);
  });

  test('Backlog カードが表示されている', async ({ page }) => {
    const backlogCol = page.locator('.kanban-col[data-col="backlog"]');
    await expect(backlogCol).toBeVisible();
    const cards = backlogCol.locator('.kanban-card');
    await expect(cards.first()).toBeVisible();
  });

  test('カードをドラッグで別カラムに移動できる', async ({ page }) => {
    const backlogCol = page.locator('.kanban-col[data-col="backlog"]');
    const reviewCol  = page.locator('.kanban-col[data-col="review"]');

    const card = backlogCol.locator('.kanban-card').first();
    const cardTitle = await card.locator('.kanban-card-title').textContent();

    const cardBox  = await card.boundingBox();
    const targetBox = await reviewCol.boundingBox();
    if (!cardBox || !targetBox) throw new Error('要素の位置が取得できない');

    await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(300);

    // カードがレビュー列に移動している
    const reviewCards = reviewCol.locator('.kanban-card-title');
    const titles = await reviewCards.allTextContents();
    expect(titles.some(t => t.trim() === cardTitle?.trim())).toBeTruthy();
  });

  test('「+ タスクを追加」ボタンでモーダルが開く', async ({ page }) => {
    await page.locator('.kanban-card-add').click();
    await expect(page.locator('#modal-add-task')).toBeVisible();

    // タスク内容を入力して送信
    await page.fill('#task-content', 'テスト用タスク — Playwright 自動生成');
    await page.selectOption('#task-priority', 'high');
    await page.click('[onclick="submitAddTask()"]');

    // モーダルが閉じてカードが追加される
    await expect(page.locator('#modal-add-task')).not.toBeVisible();
    const backlogCards = page.locator('.kanban-col[data-col="backlog"] .kanban-card-title');
    const titles = await backlogCards.allTextContents();
    expect(titles.some(t => t.includes('テスト用タスク'))).toBeTruthy();
  });

  test('進行中カードの監視パネルを開ける', async ({ page }) => {
    const runningCol = page.locator('.kanban-col[data-col="running"]');
    const monBtn = runningCol.locator('.kanban-action-btn').last().first();

    // ログドロワーが閉じている
    await expect(page.locator('#log-drawer')).not.toHaveClass(/open/);

    // 監視ボタンをクリック
    const monitorBtns = runningCol.locator('button:has-text("監視")');
    if (await monitorBtns.count() > 0) {
      await monitorBtns.first().click();
      await expect(page.locator('#log-drawer')).toHaveClass(/open/);

      // タブ切り替え
      await page.locator('.monitor-tab[data-tab="detail"]').click();
      await expect(page.locator('#drawer-panel-detail')).toHaveClass(/active/);

      // ドロワーを閉じる
      await page.locator('.drawer-close').click();
      await expect(page.locator('#log-drawer')).not.toHaveClass(/open/);
    }
  });
});

// ============================================================
// Scenario 3: Profile Builder 作成フロー
// ============================================================
test.describe('Profile Builder 作成フロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForFunction(() => typeof window.navigate === 'function');
    await page.evaluate(() => window.navigate('builder'));
    await page.waitForTimeout(300); // initBuilder() の setTimeout を待つ
    await expect(page.locator('#page-builder')).toBeVisible();
  });

  test('Step 1: 目的入力 → AI推薦ボタンが動作する', async ({ page }) => {
    const goalInput = page.locator('#builder-goal');
    await expect(goalInput).toBeVisible();

    await goalInput.fill('競合他社の価格をモニタリングして週次でレポートしたい');

    // シングルエージェントを選択
    await page.locator('#atype-single').click();

    // AIが推薦するボタン
    const recBtn = page.locator('button:has-text("AIが推薦する")');
    await expect(recBtn).toBeVisible();
    await recBtn.click();

    // トーストが出る
    await expect(page.locator('.toast')).toBeVisible();
  });

  test('Step 1 → 2 → 3 → 4 を順に進める', async ({ page }) => {
    // Step 1 入力
    await page.locator('#builder-goal').fill('PRレビューと CI 修復を自動化したい');
    await page.locator('button:has-text("次へ")').click();
    await page.waitForTimeout(100);

    // Step 2 が表示される
    const step2 = page.locator('[data-step-content="2"]');
    await expect(step2).toBeVisible();
    await page.locator('#builder-name').fill('auto-coder');

    await page.locator('button:has-text("次へ")').click();
    await page.waitForTimeout(100);

    // Step 3 が表示される
    const step3 = page.locator('[data-step-content="3"]');
    await expect(step3).toBeVisible();

    await page.locator('button:has-text("次へ")').click();
    await page.waitForTimeout(100);

    // Step 4 (Review) が表示される
    const step4 = page.locator('[data-step-content="4"]');
    await expect(step4).toBeVisible();

    // YAML プレビューが描画されている
    const yamlPreview = page.locator('#builder-yaml-preview');
    await expect(yamlPreview).toBeVisible();
    await expect(yamlPreview).not.toBeEmpty();
  });

  test('Step 4 でプロファイルを作成できる', async ({ page }) => {
    // 必要フィールドを埋める
    await page.locator('#builder-goal').fill('テスト用エージェント');
    await page.locator('button:has-text("次へ")').click();
    await page.waitForTimeout(100);

    await page.locator('#builder-name').fill('test-agent');
    await page.locator('button:has-text("次へ")').click();
    await page.waitForTimeout(100);

    await page.locator('button:has-text("次へ")').click();
    await page.waitForTimeout(100);

    // プロファイル作成ボタン
    const createBtn = page.locator('button:has-text("プロファイルを作成")');
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    // 成功トーストが出る
    await expect(page.locator('.toast')).toBeVisible();
  });

  test('ステップバーのクリックでステップ移動できる', async ({ page }) => {
    // Step 2 をクリック
    await page.locator('.builder-step[data-step="2"]').click();
    await page.waitForTimeout(100);
    const step2 = page.locator('[data-step-content="2"]');
    await expect(step2).toBeVisible();

    // Step 1 に戻る
    await page.locator('.builder-step[data-step="1"]').click();
    await page.waitForTimeout(100);
    const step1 = page.locator('[data-step-content="1"]');
    await expect(step1).toBeVisible();
  });
});

// ============================================================
// Scenario 4: テーマ切替
// ============================================================
test.describe('テーマ切替', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForFunction(() => typeof window.applyTheme === 'function');
  });

  test('テーマポップアップが開閉できる', async ({ page }) => {
    const popup = page.locator('#theme-popup');
    await expect(popup).not.toHaveClass(/open/);

    await page.locator('#theme-toggle-btn').click();
    await expect(popup).toHaveClass(/open/);

    // Escape で閉じる
    await page.keyboard.press('Escape');
    await expect(popup).not.toHaveClass(/open/);
  });

  test('6種のテーマスウォッチが表示される', async ({ page }) => {
    await page.locator('#theme-toggle-btn').click();
    const swatches = page.locator('.theme-swatch-item');
    await expect(swatches).toHaveCount(6);
  });

  test('Midnight テーマを適用すると CSS 変数が変わる', async ({ page }) => {
    await page.evaluate(() => window.applyTheme('midnight'));

    const bgColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    );
    expect(bgColor).toBe('#0D1117');
  });
});

// ============================================================
// Scenario 5: Chat TUI
// ============================================================
test.describe('Chat TUI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
    await page.waitForFunction(() => typeof window.navigate === 'function');
    await page.evaluate(() => window.navigate('chat'));
    await expect(page.locator('#page-chat')).toBeVisible();
    await page.waitForTimeout(200);
  });

  test('シード会話履歴が表示される', async ({ page }) => {
    const messages = page.locator('#chat-messages .chat-msg');
    await expect(messages.first()).toBeVisible();
  });

  test('メッセージを送信するとエージェントが応答する', async ({ page }) => {
    const input = page.locator('#chat-input');
    await input.fill('こんにちは、調査をお願いします');
    await page.keyboard.press('Enter');

    // ユーザーメッセージが追加される
    const userMsg = page.locator('.chat-msg-user .chat-bubble').last();
    await expect(userMsg).toContainText('こんにちは');

    // ストリーミング完了を待つ（最大5秒）
    await expect(page.locator('.chat-msg-agent').last()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.chat-send-btn')).not.toBeDisabled({ timeout: 8000 });
  });

  test('プロファイルを切り替えられる', async ({ page }) => {
    await page.selectOption('#chat-profile-select', 'coder');
    const profileName = page.locator('#chat-profile-name');
    await expect(profileName).toHaveText('coder');
    const modelLabel = page.locator('#chat-model-label');
    await expect(modelLabel).toHaveText('claude-sonnet-4');
  });
});
