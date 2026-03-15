# 🛠️ 工具与特效补全方案

> **文档版本**: v1.0  
> **创建日期**: 2026-01-13  
> **优先级**: 🟡 MEDIUM

---

## 1. 问题概述

### 1.1 工具定义不完整

`constants.ts` 中的 LLM Prompt **只告诉模型有 1 个工具**，但 `toolService.ts` 实际有 **13 个工具**。

### 1.2 特效未完全实现

`useActionDispatcher.ts` 只实现了 `CONFETTI` 和 `SNOW`，其他特效静默失败。

---

## 2. 工具同步修复

### 2.1 当前对比

| 工具名称 | Prompt 定义 | 实现 | 状态 |
|----------|-------------|------|------|
| `get_weather` | ✅ | ✅ Real API | ✅ |
| `get_crypto_price` | ❌ | ✅ Real API | ⚠️ |
| `get_stock_price` | ❌ | ✅ Mock | ⚠️ |
| `search_knowledge` | ❌ | ✅ Mock | ⚠️ |
| `send_email` | ❌ | ✅ Mock | ⚠️ |
| `schedule_meeting` | ❌ | ✅ Mock | ⚠️ |
| `add_to_cart` | ❌ | ✅ Mock | ⚠️ |
| `calculate_loan` | ❌ | ✅ Mock | ⚠️ |
| `translate_text` | ❌ | ✅ Mock | ⚠️ |
| `create_ticket` | ❌ | ✅ Mock | ⚠️ |
| `book_reservation` | ❌ | ✅ Mock | ⚠️ |
| `currency_convert` | ❌ | ✅ Mock | ⚠️ |
| `get_news` | ❌ | ✅ Mock | ⚠️ |

### 2.2 修复方案

#### [MODIFY] [constants.ts](file:///d:/rag/architect/constants.ts)

在 `SYSTEM_INSTRUCTION` 的 `**AVAILABLE TOOLS:**` 部分替换为：

```typescript
**AVAILABLE TOOLS:**
When the user asks for real-time or dynamic data, output a tool_call:
{ "tool_call": { "name": "tool_name", "arguments": { ... } } }

Available tools:
| Tool | Arguments | Description |
|------|-----------|-------------|
| \`get_weather\` | \`{ "location": "city" }\` | Real-time weather data |
| \`get_crypto_price\` | \`{ "coin_id": "bitcoin" }\` | Crypto prices (CoinGecko) |
| \`get_stock_price\` | \`{ "symbol": "AAPL" }\` | Stock data with chart |
| \`search_knowledge\` | \`{ "query": "search term" }\` | Internal KB search |
| \`get_news\` | \`{ "category": "tech" }\` | News headlines |
| \`currency_convert\` | \`{ "amount": 100, "from": "USD", "to": "EUR" }\` | FX conversion |
| \`calculate_loan\` | \`{ "amount": 10000, "rate": 5, "years": 3 }\` | Loan calculator |
| \`translate_text\` | \`{ "text": "hello", "target_language": "zh" }\` | Translation |
| \`send_email\` | \`{ "to": "email", "subject": "...", "body": "..." }\` | Send email |
| \`schedule_meeting\` | \`{ "title": "...", "date": "...", "participants": [] }\` | Book meeting |
| \`create_ticket\` | \`{ "title": "...", "priority": "High" }\` | Support ticket |
| \`book_reservation\` | \`{ "place": "...", "date": "...", "guests": 2 }\` | Restaurant booking |
| \`add_to_cart\` | \`{ "item": "...", "price": 99.99 }\` | E-commerce cart |
```

---

## 3. 特效补全修复

### 3.1 当前实现

```typescript
// useActionDispatcher.ts:87-108
const handleTriggerEffect: ActionHandler = (action) => {
  const effect = action.payload?.effect;
  if (effect === 'CONFETTI') { /* ✅ 实现 */ }
  if (effect === 'SNOW') { /* ✅ 实现 */ }
  // ❌ 其他特效静默失败
};
```

### 3.2 修复方案

#### [MODIFY] [useActionDispatcher.ts](file:///d:/rag/architect/hooks/useActionDispatcher.ts)

扩展 `handleTriggerEffect` 函数：

```typescript
const handleTriggerEffect: ActionHandler = (action, ctx) => {
  const effect = action.payload?.effect;
  
  switch (effect) {
    case 'CONFETTI':
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      break;
      
    case 'SNOW':
      confetti({
        particleCount: 100,
        spread: 360,
        ticks: 200,
        gravity: 0.4,
        decay: 0.94,
        startVelocity: 30,
        origin: { y: 0 },
        colors: ['#ffffff', '#e0f2fe']
      });
      break;
      
    case 'FIREWORKS':
      // 多次发射模拟烟花
      const duration = 3000;
      const end = Date.now() + duration;
      const interval = setInterval(() => {
        if (Date.now() > end) return clearInterval(interval);
        confetti({
          particleCount: 50,
          angle: 60 + Math.random() * 60,
          spread: 55,
          origin: { x: Math.random(), y: 0.7 }
        });
      }, 250);
      break;
      
    case 'HEARTS':
      confetti({
        particleCount: 50,
        spread: 60,
        shapes: ['circle'],
        colors: ['#ff6b6b', '#ff8787', '#ffa8a8', '#ffc9c9'],
        origin: { y: 0.7 }
      });
      break;
      
    case 'SPARKLE':
      confetti({
        particleCount: 80,
        spread: 100,
        colors: ['#ffd700', '#ffec8b', '#fff8dc'],
        shapes: ['star'],
        gravity: 0.3,
        origin: { y: 0.5 }
      });
      break;
      
    default:
      console.warn(`[ActionDispatcher] Unknown effect: ${effect}`);
      ctx.showToast({
        type: 'WARNING',
        title: 'Unknown Effect',
        description: `Effect "${effect}" is not implemented.`
      });
  }
};
```

### 3.3 更新 constants.ts 中的特效文档

```typescript
* "TRIGGER_EFFECT": { "effect": "CONFETTI" | "SNOW" | "FIREWORKS" | "HEARTS" | "SPARKLE" }
```

---

## 4. 修改文件清单

| 文件 | 行号 | 修改类型 | 描述 |
|------|------|----------|------|
| `constants.ts` | 349-350 | 替换 | 完整工具列表 |
| `constants.ts` | 70 | 更新 | 特效枚举 |
| `useActionDispatcher.ts` | 87-108 | 扩展 | 添加 FIREWORKS, HEARTS, SPARKLE |

---

## 5. 验证方案

### 5.1 工具调用测试

```typescript
// tests/tool-calls.test.ts
describe('Tool Discovery', () => {
  it('should list all tools in SYSTEM_INSTRUCTION', () => {
    const toolNames = [
      'get_weather', 'get_crypto_price', 'get_stock_price', 
      'search_knowledge', 'get_news', 'currency_convert',
      'calculate_loan', 'translate_text', 'send_email',
      'schedule_meeting', 'create_ticket', 'book_reservation', 'add_to_cart'
    ];
    
    toolNames.forEach(tool => {
      expect(SYSTEM_INSTRUCTION).toContain(tool);
    });
  });
});
```

### 5.2 特效测试

```typescript
// tests/effects.test.ts
describe('Trigger Effects', () => {
  const effects = ['CONFETTI', 'SNOW', 'FIREWORKS', 'HEARTS', 'SPARKLE'];
  
  effects.forEach(effect => {
    it(`should handle ${effect} effect without error`, () => {
      expect(() => {
        handleTriggerEffect({ type: 'TRIGGER_EFFECT', payload: { effect } }, mockCtx);
      }).not.toThrow();
    });
  });
  
  it('should warn on unknown effect', () => {
    const warnSpy = vi.spyOn(console, 'warn');
    handleTriggerEffect({ type: 'TRIGGER_EFFECT', payload: { effect: 'UNKNOWN' } }, mockCtx);
    expect(warnSpy).toHaveBeenCalled();
  });
});
```

### 5.3 手动验证步骤

1. 启动开发服务器: `pnpm dev`
2. 输入 "Show me Tokyo weather" 验证 `get_weather`
3. 输入 "Convert 100 USD to EUR" 验证 `currency_convert`
4. 创建带 "Celebrate" 按钮的 UI，点击验证特效

---

## 6. 实施时间线

| 阶段 | 任务 | 时间 |
|------|------|------|
| 1 | 更新 constants.ts 工具列表 | 0.5 天 |
| 2 | 扩展 handleTriggerEffect | 0.5 天 |
| 3 | 单元测试 | 0.5 天 |

**总计**: 1.5 天

---

*Generated by DocSeer*
