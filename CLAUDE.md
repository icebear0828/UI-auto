# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mandatory Workflow (每次改动必须按此顺序执行，不可跳步)

### Step 1: 写测试（BEFORE 写任何产品代码）

触发条件：新增模块、新增 schema、新增组件、修改接口
- [ ] 创建/更新 test 文件，定义预期行为
- [ ] 如涉及 Zod schema：加 `zodToJsonSchema` 兼容性测试，断言输出不含 `prefixItems`、`allOf`
- [ ] 运行测试确认 **红灯**（测试存在且失败，证明测试有效）

### Step 2: 写实现

- [ ] 写产品代码使测试通过
- [ ] `pnpm exec tsc --noEmit` 通过
- [ ] `pnpm test` 全绿

### Step 3: E2E 浏览器验证（BEFORE 向用户报告完成）

触发条件：改动涉及 AI 调用 / 流式生成 / Schema / Provider / 配置
- [ ] `pnpm dev` 启动 dev server
- [ ] 在浏览器中实际提交 prompt
- [ ] 确认渲染正确、无 console 报错
- [ ] **仅 tsc + unit test 通过不算完成，必须走到这一步**

### Step 4: 向用户交付

只有 Step 1-3 全部完成后才能告诉用户"完成了"。

---

### Schema 硬约束

- Zod schema 通过 `zodToJsonSchema` 转成 JSON Schema 用于 OpenAI 兼容 API 的 `response_format`
- **禁止** `z.tuple`、`z.intersection`、带 runtime 副作用的 `z.transform`
- 坐标/点 用 `z.object({ x: z.number(), y: z.number() })` 而非 `z.tuple`

### Code Quality 硬约束

- TypeScript 禁止 `any`（含 `as any`、`: any`、`<any>`）
- 删除/重命名 symbol 后，grep `src/` + `tests/` 确认零残留
- 不加未要求的 docstring、注释、类型标注

## Project Overview

GenUI Architect is an AI-powered UI generator that uses Google Gemini to dynamically create React UI components from natural language prompts. It renders a JSON-based UINode tree with streaming generation, self-healing error recovery, an edit/refine mode, and a visual novel (galgame) mode.

## Development Commands

```bash
pnpm install                  # Install dependencies
pnpm dev                      # Dev server at http://localhost:12345
pnpm build                    # Production build to dist/
pnpm exec tsc --noEmit        # Type check (CI runs this)

# Unit tests (vitest, jsdom environment)
pnpm test                     # Run once
pnpm test:watch               # Watch mode
pnpm test:coverage            # With v8 coverage

# Run a single test file
pnpm exec vitest run tests/schemas.test.ts

# E2E tests (playwright, chromium)
pnpm test:e2e                 # Headless (all tests)
pnpm test:e2e:ui              # Interactive UI
pnpm test:e2e:debug           # Debug mode

# E2E by category (@api tag splits API-dependent vs pure UI tests)
pnpm exec playwright test --grep-invert @api   # UI-only (no API key needed)
pnpm exec playwright test --grep @api          # API-dependent (needs GEMINI_API_KEY)
```

## Environment Setup

Create `.env.local` at project root:
```
GEMINI_API_KEY=your_api_key_here
```
Vite exposes it as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY` via `define` in `vite.config.ts`.

## Architecture

### Project Layout

All source code lives under `src/`. Config files, tests, and tooling remain at root.

```
architect/
├── src/
│   ├── App.tsx, index.tsx, index.css, types.ts
│   ├── constants/          (4 modules + index barrel)
│   ├── components/
│   │   ├── workspace/
│   │   │   ├── sidebar/    (7 sub-components + index)
│   │   │   └── ...
│   │   ├── ui/             (29 components + theme/animations/registry)
│   │   └── galgame/
│   ├── hooks/              (useGenUI orchestrator + 3 sub-hooks + utility hooks)
│   ├── services/
│   │   ├── schemas/        (8 modules: helpers, layout, form, display, composite, vn-stage, validation, index)
│   │   ├── tools/          (7 modules: types, registry, weather, crypto, business, utilities, index)
│   │   ├── ai/             (IAIProvider + GeminiProvider + provider factory)
│   │   └── ...             (telemetry, logger, streamParser, etc.)
│   └── types/              (actions.ts, settings.ts)
├── tests/                  (unit + e2e, uses @/ alias to import src)
├── index.html, tsconfig.json, vite.config.ts, tailwind.config.js, ...
```

### Path Alias

`@/*` maps to `src/*` (configured in both `tsconfig.json` and `vite.config.ts`). All cross-directory imports use `@/` alias; same-directory imports use relative paths.

### Core Data Flow

1. **User Input** → `useGenUI` hook orchestrates all state and AI calls
2. **AI Generation** → `services/ai/` provider streams JSON via Gemini API (`getAIProvider()`)
3. **Streaming Parse** → `services/streamParser.ts` incrementally repairs partial JSON from the stream
4. **Tool Calls** → If the AI returns `{ "tool_call": {...} }`, `services/tools/` registry executes it and feeds the result back
5. **Validation** → `services/schemas/` (Zod) validates the UINode structure; `services/validationCache.ts` caches results
6. **Rendering** → `components/DynamicRenderer.tsx` recursively renders validated nodes using `ComponentRegistry`

### UINode Type

The entire UI is a recursive JSON tree: `{ "componentType": { ...props, children?: UINode[] } }`. Each node has exactly one key (the component type).

- **`UINode`** (`types.ts`): Loose `{ [key: string]: any }` used for streaming/unvalidated contexts
- **`TypedUINode`** (`services/schemas/`): Discriminated union with full type safety — use for post-validation code

### Component Registry (`components/ui/Registry.tsx`)

Maps component type strings to React components. Heavy components (Chart, Map, Table, VNStage) use `safeLazy` for code splitting.

**To add a new component:**
1. Create component in `src/components/ui/`
2. Add Zod schema in appropriate `src/services/schemas/` module and include in UINodeSchema union in `index.ts`
3. Register in `ComponentRegistry` map in `Registry.tsx`
4. Add COMPONENT_SPECS entry in `src/constants/componentSpecs.ts`

### State Management

- **useGenUI** (`hooks/useGenUI.ts`): Thin orchestrator composing sub-hooks, returns `{ state, refs, actions, history }`
  - **useMessageState** (`hooks/useMessageState.ts`): Messages (via useHistory), streamingNode, metrics, diagnostics
  - **useUIGeneration** (`hooks/useUIGeneration.ts`): Streaming generation, cancel, retry, tool call recursion, self-healing
  - **useEditorMode** (`hooks/useEditorMode.ts`): Edit mode, selectedPath, refine/fix, createVariation
- **useHistory** (`hooks/useHistory.ts`): Time-travel undo/redo wrapping the message array; keyboard shortcuts Ctrl+Z / Ctrl+Y
- **useActionDispatcher** (`hooks/useActionDispatcher.ts`): Handles UIAction protocol (NAVIGATE, OPEN_MODAL, TRIGGER_EFFECT, SUBMIT_FORM, PATCH_STATE, etc.)
- **useFormManager** (`hooks/useFormManager.ts`): Collects form data from rendered components
- **useStatePatching** (`hooks/useStatePatching.ts`): Applies PATCH_STATE actions to the UINode tree
- **EditorContext** (`components/EditorContext.tsx`): Edit mode state for component selection/inspection
- **DeviceContext** (`components/DeviceContext.tsx`): Current device/theme context for responsive rendering

### AI Provider Architecture

Single provider pattern via `getAIProvider()` singleton factory (`services/ai/provider.ts`):

- `services/ai/IAIProvider.ts` — Interface (Port): `generateStream()`, `refine()`, `fix()`, `generateImage?()`
- `services/ai/GeminiProvider.ts` — Gemini implementation via `@google/genai` SDK
- `services/ai/provider.ts` — Singleton factory returning the active provider

### Tool Service (`services/tools/`)

Registry-based pattern. Each tool module self-registers via `registerTool()`:
- `weather.ts` — Real API (Open-Meteo) + mock fallback
- `crypto.ts` — Real API (CoinGecko) + mock fallback
- `business.ts` — Mock: send_email, schedule_meeting, add_to_cart, create_ticket, book_reservation
- `utilities.ts` — Mock/calc: calculate_loan, translate_text, currency_convert, get_news, get_stock_price, search_knowledge

### Self-Healing Pipeline

1. `DynamicRenderer`'s `ErrorBoundary` catches render errors
2. `onError` callback triggers `fixNode()` in `useUIGeneration`
3. `getAIProvider().fix()` sends the broken node + error to AI for repair
4. Fixed node replaces the broken one in message history via path-based update (`setByPath`)

### Workspace Layout

`App.tsx` composes: `ThemeProvider` → `ToastProvider` → `Workspace`. Workspace has three zones:
- **Left sidebar** (`components/workspace/sidebar/`): Header, tabs, chat messages, layers, refinement bar, prompt input, mode toggle
- **Center canvas** (`components/workspace/DeviceWrapper.tsx`): Renders active UINode inside a device frame
- **Right panel** (`components/InspectorPanel.tsx`): Component inspector (visible in edit mode)

### Special Features

- **Theme Agent** (`services/themeAgent.ts`): `/theme` command generates custom themes via AI
- **Galgame/VN Mode** (`components/galgame/`): Visual novel engine with background, character, dialogue layers
- **Telemetry** (`services/telemetry.ts`): Pub-sub event system tracking TTFT, stream latency, hallucinations
- **Sound Engine** (`hooks/useSound.ts`): UI sound effects (configurable via `config.soundEnabled`)
- **Diagnostics** (`services/diagnosticData.ts`): Built-in component test suite via `/system_diagnostics`

## Testing

- **Unit tests**: `tests/*.test.ts` (services), `tests/components/*.test.tsx`, `tests/hooks/*.test.ts`
- **E2E tests**: `tests/e2e/*.spec.ts` with shared fixtures in `tests/e2e/fixtures/`
  - API-dependent tests use `@api` tag in `test.describe` name (ui-generation, tool-calls, effects, responsive, history)
  - Pure UI tests have no tag (workspace, settings) — run without API key
  - All interactive elements use `data-testid` attributes for stable selectors
- **Setup**: `tests/setup.ts` mocks matchMedia, ResizeObserver, IntersectionObserver, Audio API, crypto
- Vitest config explicitly excludes `tests/e2e/`; Playwright runs only from `tests/e2e/`
- Tests use `@/` alias to import from `src/`

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs four jobs: `test` (type check + unit tests + build), `lint` (type check), `e2e-ui` (pure UI playwright tests, no API key), `e2e` (API-dependent playwright tests). Uses pnpm 9, Node 20.

## Maintenance Skills (Quick Reference)

7 engineering maintenance skills for keeping the codebase in sync:

| Command | Skill | What it does |
|---------|-------|-------------|
| `/add-component <name>` | add-component | Scaffold a new UI component across 6 files (schema, registry, constants, types, tests) |
| `/sync-audit` | sync-audit | Audit registries (schemas/, constants/, Registry.tsx) for sync issues |
| `/add-action <NAME>` | add-action | Scaffold a new UIAction type with handler, docs, and tests |
| `/add-tool <name>` | add-tool | Scaffold a new Tool in services/tools/ + update LLM prompts |
| `/test-gaps` | test-gaps | Analyze test coverage gaps across components/hooks/services |
| `/preflight` | preflight-check | Pre-release validation: tsc + tests + build + sync-audit + code smells |
| `/visual-test [mode]` | visual-test | Validate UINode generation with Schema checks and HTML preview rendering |

**Key sync points** (files that must stay in sync when adding components):
- `src/services/schemas/` — Zod schemas, UINodeSchema union, ValidComponentType, TypedUINode
- `src/components/ui/Registry.tsx` — Runtime component mapping
- `src/constants/componentSpecs.ts` — COMPONENT_SPECS (AI prompt)
- `src/constants/systemInstruction.ts` — SYSTEM_INSTRUCTION (tool definitions)
