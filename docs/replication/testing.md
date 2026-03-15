# 测试指南

> 本文档描述项目的测试策略和配置

---

## 测试栈

| 工具 | 用途 |
|------|------|
| Vitest | 测试运行器 |
| @testing-library/react | React 组件测试 |
| @testing-library/jest-dom | DOM 断言扩展 |
| jsdom | 浏览器环境模拟 |

---

## 配置

### vite.config.ts

```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./tests/setup.ts'],
  include: ['tests/**/*.{test,spec}.{ts,tsx}'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html'],
    exclude: ['node_modules/', 'tests/']
  }
}
```

### tests/setup.ts

```typescript
import '@testing-library/jest-dom';
```

---

## 运行命令

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# 覆盖率报告
pnpm test:coverage
```

---

## 测试文件结构

```
tests/
├── setup.ts              # 全局配置
├── constants.test.ts     # 常量测试
├── schemas.test.ts       # Schema 验证测试
└── streamParser.test.ts  # 流解析器测试
```

---

## 测试示例

### Schema 验证测试 (`schemas.test.ts`)

```typescript
import { describe, it, expect } from 'vitest';
import { validateNode } from '../services/schemas';

describe('UINodeSchema', () => {
  it('validates container node', () => {
    const node = {
      container: {
        layout: 'COL',
        children: [{ text: { content: 'Hello' } }]
      }
    };
    const result = validateNode(node);
    expect(result.success).toBe(true);
  });

  it('rejects invalid node', () => {
    const node = { unknownComponent: {} };
    const result = validateNode(node);
    expect(result.success).toBe(false);
  });
});
```

### Stream Parser 测试 (`streamParser.test.ts`)

```typescript
import { describe, it, expect } from 'vitest';
import { parsePartialJson } from '../services/streamParser';

describe('parsePartialJson', () => {
  it('parses complete JSON', () => {
    const input = '{"container":{"layout":"COL"}}';
    expect(parsePartialJson(input)).toEqual({ container: { layout: 'COL' } });
  });

  it('handles incomplete JSON', () => {
    const input = '{"container":{"layout":"COL"';
    const result = parsePartialJson(input);
    expect(result).not.toBeNull();
  });

  it('returns null for empty input', () => {
    expect(parsePartialJson('')).toBeNull();
  });
});
```

---

## 测试覆盖目标

| 模块 | 覆盖率目标 |
|------|-----------|
| `schemas.ts` | 90%+ |
| `streamParser.ts` | 85%+ |
| `constants.ts` | 100% |
| Hooks | 70%+ |
| Components | 60%+ |
