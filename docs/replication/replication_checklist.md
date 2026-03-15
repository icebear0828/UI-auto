# 复刻验证清单

> 使用此清单验证项目复刻的完整性

---

## 1. 环境准备

- [ ] Node.js >= 18.x 已安装
- [ ] pnpm 已安装 (`npm install -g pnpm`)
- [ ] Gemini API Key 已获取

---

## 2. 依赖安装

```bash
# 克隆或创建项目目录
mkdir genui-architect && cd genui-architect

# 复制 package.json (参见 dependencies.md)
# 安装依赖
pnpm install
```

- [ ] `package.json` 已创建
- [ ] `pnpm install` 成功完成
- [ ] `node_modules/` 存在

---

## 3. 配置文件

- [ ] `tsconfig.json` 已创建
- [ ] `vite.config.ts` 已创建
- [ ] `tailwind.config.js` 已创建
- [ ] `postcss.config.js` 已创建
- [ ] `.env` 已创建并配置 `GEMINI_API_KEY`

---

## 4. 核心类型

- [ ] `types.ts` - UINode, UIAction, UserContext, Message
- [ ] `types/actions.ts` - ActionContext, ToastOptions
- [ ] `types/settings.ts` - ModelConfig

---

## 5. 常量与提示词

- [ ] `constants.ts` 包含:
  - [ ] `INITIAL_CONTEXT`
  - [ ] `COMPONENT_SPECS` (组件定义)
  - [ ] `FEW_SHOT_EXAMPLES` (示例)
  - [ ] `SYSTEM_INSTRUCTION` (系统提示)

---

## 6. Hooks 层

- [ ] `hooks/useGenUI.ts` - 主编排器
- [ ] `hooks/useActionDispatcher.ts` - Action 分发
- [ ] `hooks/useHistory.ts` - 时间旅行
- [ ] `hooks/useFormManager.ts` - 表单管理
- [ ] `hooks/useStatePatching.ts` - 状态补丁
- [ ] `hooks/useSound.ts` - 音效
- [ ] `hooks/useDebounce.ts` - 防抖
- [ ] `hooks/useStableCallback.ts` - 稳定回调

---

## 7. Services 层

- [ ] `services/geminiService.ts` - AI 生成
- [ ] `services/toolService.ts` - 工具执行
- [ ] `services/schemas.ts` - Zod 验证
- [ ] `services/streamParser.ts` - 流解析
- [ ] `services/telemetry.ts` - 遥测
- [ ] `services/validationCache.ts` - 验证缓存
- [ ] `services/animationCache.ts` - 动画缓存
- [ ] `services/ai/GeminiProvider.ts` - Provider 实现

---

## 8. Components 层

### 核心渲染

- [ ] `components/DynamicRenderer.tsx`
- [ ] `components/ui/Registry.tsx`
- [ ] `components/ui/renderUtils.tsx`
- [ ] `components/ui/theme.ts`
- [ ] `components/ui/animations.ts`

### UI 组件 (26+)

- [ ] Container, Card, Hero, BentoGrid, SplitPane
- [ ] Input, Textarea, Switch, Slider, Calendar
- [ ] Button, Tabs, Stepper, Accordion
- [ ] Typography, StatCard, Progress, Alert, Badge, Avatar, Image
- [ ] Table, Chart, Timeline, Kanban, CodeBlock, Map
- [ ] Separator

### Workspace

- [ ] `components/workspace/Sidebar.tsx`
- [ ] `components/workspace/Toolbar.tsx`
- [ ] `components/workspace/DeviceWrapper.tsx`

### Galgame

- [ ] `components/galgame/VNStage.tsx`
- [ ] `components/galgame/layers/`

---

## 9. 入口文件

- [ ] `index.html` - ImportMap 配置
- [ ] `index.tsx` - React 挂载
- [ ] `index.css` - 全局样式
- [ ] `App.tsx` - 主应用

---

## 10. 功能验证

```bash
# 启动开发服务器
pnpm dev
```

- [ ] 开发服务器在 http://localhost:3000 启动
- [ ] 首页 UI 正常渲染
- [ ] 输入 Prompt 后 AI 生成 UI
- [ ] 流式渲染效果正常
- [ ] 组件交互 (Button, Input, Switch) 正常
- [ ] Undo/Redo (Ctrl+Z / Ctrl+Y) 正常
- [ ] 编辑模式 (选中组件) 正常
- [ ] 主题切换 (/theme 命令) 正常

---

## 11. 测试验证

```bash
# 运行测试
pnpm test
```

- [ ] Schema 测试通过
- [ ] StreamParser 测试通过
- [ ] Constants 测试通过

---

## 12. 构建验证

```bash
# 生产构建
pnpm build
```

- [ ] 构建成功
- [ ] `dist/` 目录生成
- [ ] 无 TypeScript 错误

---

## 完成标准

| 检查项 | 状态 |
|--------|------|
| 所有必需文件存在 | ⬜ |
| 开发服务器正常运行 | ⬜ |
| AI 生成功能正常 | ⬜ |
| 组件渲染正确 | ⬜ |
| 测试全部通过 | ⬜ |
| 生产构建成功 | ⬜ |

---

> [!TIP]
> 如遇问题，请对照 `source_snippets.md` 核对关键代码实现
