# 🎭 Playwright E2E 测试配置

> **文档版本**: v1.0  
> **创建日期**: 2026-01-13  
> **优先级**: 🟡 MEDIUM

---

## 1. 概述

当前项目只有单元测试 (Vitest)，缺乏端到端 UI 流程测试。本方案使用 **Playwright** 进行 E2E 测试。

---

## 2. 安装配置

### 2.1 安装依赖

```bash
# 安装 Playwright
pnpm add -D @playwright/test

# 安装浏览器
pnpm exec playwright install chromium
```

### 2.2 配置文件

#### [NEW] [playwright.config.ts](file:///d:/rag/architect/playwright.config.ts)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### 2.3 添加 NPM 脚本

#### [MODIFY] [package.json](file:///d:/rag/architect/package.json)

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## 3. 测试用例

### 3.1 目录结构

```
tests/
├── e2e/
│   ├── ui-generation.spec.ts    # UI 生成流程
│   ├── responsive.spec.ts       # 响应式验证
│   ├── tool-calls.spec.ts       # 工具调用
│   ├── effects.spec.ts          # 特效触发
│   └── fixtures/
│       └── test-utils.ts        # 共享工具
└── ... (existing unit tests)
```

### 3.2 共享工具函数

#### [NEW] [tests/e2e/fixtures/test-utils.ts](file:///d:/rag/architect/tests/e2e/fixtures/test-utils.ts)

```typescript
import { Page, expect } from '@playwright/test';

export async function submitPrompt(page: Page, prompt: string) {
  await page.fill('textarea[placeholder*="prompt"]', prompt);
  await page.press('textarea', 'Enter');
}

export async function waitForUIGeneration(page: Page, timeout = 30000) {
  await page.waitForSelector('[data-streaming="false"]', { timeout });
}

export async function switchToMobile(page: Page) {
  await page.click('button[title="Mobile"], [data-testid="device-mobile"]');
}

export async function switchToDesktop(page: Page) {
  await page.click('button[title="Desktop"], [data-testid="device-desktop"]');
}

export async function verifyNoHorizontalScroll(page: Page) {
  const content = page.locator('.custom-scrollbar').first();
  const scrollWidth = await content.evaluate(el => el.scrollWidth);
  const clientWidth = await content.evaluate(el => el.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
}
```

### 3.3 UI 生成测试

#### [NEW] [tests/e2e/ui-generation.spec.ts](file:///d:/rag/architect/tests/e2e/ui-generation.spec.ts)

```typescript
import { test, expect } from '@playwright/test';
import { submitPrompt, waitForUIGeneration } from './fixtures/test-utils';

test.describe('UI Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should generate a dashboard UI', async ({ page }) => {
    await submitPrompt(page, 'Create a simple dashboard with 3 stat cards');
    await waitForUIGeneration(page);
    
    // 验证生成了 card 组件
    const cards = page.locator('[data-component="card"], [class*="card"]');
    await expect(cards.first()).toBeVisible();
  });

  test('should handle streaming gracefully', async ({ page }) => {
    await submitPrompt(page, 'Create a login form');
    
    // 验证 streaming 指示器出现
    const streamingIndicator = page.locator('text=STREAMING');
    await expect(streamingIndicator).toBeVisible({ timeout: 5000 });
    
    // 等待完成
    await waitForUIGeneration(page);
    await expect(streamingIndicator).not.toBeVisible();
  });

  test('should display error on API failure', async ({ page }) => {
    // 模拟 API 失败（可通过 mock 或无效配置触发）
    // 注意：这需要能够控制 API 响应的方式
    // 暂时跳过，待实现 API mock 后启用
    test.skip();
  });
});
```

### 3.4 响应式测试

#### [NEW] [tests/e2e/responsive.spec.ts](file:///d:/rag/architect/tests/e2e/responsive.spec.ts)

```typescript
import { test, expect } from '@playwright/test';
import { 
  submitPrompt, 
  waitForUIGeneration, 
  switchToMobile, 
  switchToDesktop,
  verifyNoHorizontalScroll 
} from './fixtures/test-utils';

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('mobile view should use 400px wrapper', async ({ page }) => {
    await switchToMobile(page);
    await submitPrompt(page, 'Create a card with some text');
    await waitForUIGeneration(page);
    
    const wrapper = page.locator('.w-\\[400px\\]');
    await expect(wrapper).toBeVisible();
  });

  test('desktop view should use 1100px wrapper', async ({ page }) => {
    await switchToDesktop(page);
    await submitPrompt(page, 'Create a card with some text');
    await waitForUIGeneration(page);
    
    const wrapper = page.locator('.w-\\[1100px\\]');
    await expect(wrapper).toBeVisible();
  });

  test('mobile UI should not have horizontal scroll', async ({ page }) => {
    await switchToMobile(page);
    await submitPrompt(page, 'Create a dashboard with 5 stat cards');
    await waitForUIGeneration(page);
    
    await verifyNoHorizontalScroll(page);
  });

  test('switching device should re-render correctly', async ({ page }) => {
    // 先生成桌面 UI
    await switchToDesktop(page);
    await submitPrompt(page, 'Create a simple form');
    await waitForUIGeneration(page);
    
    // 切换到手机
    await switchToMobile(page);
    await page.waitForTimeout(500); // 等待动画
    
    // 验证容器宽度变化
    const wrapper = page.locator('.w-\\[400px\\]');
    await expect(wrapper).toBeVisible();
  });
});
```

### 3.5 工具调用测试

#### [NEW] [tests/e2e/tool-calls.spec.ts](file:///d:/rag/architect/tests/e2e/tool-calls.spec.ts)

```typescript
import { test, expect } from '@playwright/test';
import { submitPrompt, waitForUIGeneration } from './fixtures/test-utils';

test.describe('Tool Calls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should fetch and display weather data', async ({ page }) => {
    await submitPrompt(page, 'What is the weather in Tokyo?');
    await waitForUIGeneration(page, 45000); // 工具调用可能需要更长时间
    
    // 验证天气数据显示
    const content = await page.textContent('body');
    expect(content).toMatch(/tokyo|weather|temperature|°/i);
  });

  test('should handle crypto price query', async ({ page }) => {
    await submitPrompt(page, 'Show me the Bitcoin price');
    await waitForUIGeneration(page, 45000);
    
    const content = await page.textContent('body');
    expect(content).toMatch(/bitcoin|btc|\$/i);
  });
});
```

### 3.6 特效测试

#### [NEW] [tests/e2e/effects.spec.ts](file:///d:/rag/architect/tests/e2e/effects.spec.ts)

```typescript
import { test, expect } from '@playwright/test';
import { submitPrompt, waitForUIGeneration } from './fixtures/test-utils';

test.describe('Trigger Effects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should trigger confetti on button click', async ({ page }) => {
    await submitPrompt(page, 'Create a button that triggers confetti when clicked');
    await waitForUIGeneration(page);
    
    // 找到并点击带有 confetti 动作的按钮
    const button = page.locator('button:has-text("Celebrate"), button:has-text("Confetti")').first();
    
    if (await button.isVisible()) {
      await button.click();
      
      // 验证 confetti canvas 出现
      await page.waitForTimeout(500);
      const canvas = page.locator('canvas');
      // confetti 库会创建 canvas 元素
      await expect(canvas).toBeVisible();
    } else {
      // 如果 LLM 没有生成带特效的按钮，跳过
      test.skip();
    }
  });
});
```

---

## 4. CI 集成

### 4.1 GitHub Actions

#### [MODIFY] [.github/workflows/ci.yml](file:///d:/rag/architect/.github/workflows/ci.yml)

在现有 CI 中添加 E2E 测试 job:

```yaml
  e2e:
    runs-on: ubuntu-latest
    needs: test  # 依赖单元测试通过
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

---

## 5. 修改文件清单

| 文件 | 操作 | 描述 |
|------|------|------|
| `playwright.config.ts` | 新建 | Playwright 配置 |
| `package.json` | 修改 | 添加 test:e2e 脚本 |
| `tests/e2e/fixtures/test-utils.ts` | 新建 | 共享测试工具 |
| `tests/e2e/ui-generation.spec.ts` | 新建 | UI 生成测试 |
| `tests/e2e/responsive.spec.ts` | 新建 | 响应式测试 |
| `tests/e2e/tool-calls.spec.ts` | 新建 | 工具调用测试 |
| `tests/e2e/effects.spec.ts` | 新建 | 特效触发测试 |
| `.github/workflows/ci.yml` | 修改 | 添加 E2E job |

---

## 6. 运行测试

### 本地运行

```bash
# 运行所有 E2E 测试
pnpm test:e2e

# 交互式 UI 模式
pnpm test:e2e:ui

# 调试模式
pnpm test:e2e:debug

# 只运行响应式测试
pnpm test:e2e responsive
```

### CI 运行

推送到 GitHub 后自动运行，失败时上传报告到 Artifacts。

---

## 7. 实施时间线

| 阶段 | 任务 | 时间 |
|------|------|------|
| 1 | 安装配置 Playwright | 0.5 天 |
| 2 | 编写测试工具函数 | 0.25 天 |
| 3 | 编写 UI 生成测试 | 0.5 天 |
| 4 | 编写响应式测试 | 0.5 天 |
| 5 | 编写工具/特效测试 | 0.5 天 |
| 6 | CI 集成 | 0.25 天 |

**总计**: 2.5 天

---

*Generated by DocSeer*
