# 代码地图

> 本文档描述项目目录结构与核心文件职责

## 根目录结构

```
genui-architect/
├── index.html          # HTML 入口，ImportMap 配置
├── index.tsx           # React 挂载点
├── index.css           # 全局样式 + Aurora 动画
├── App.tsx             # 主应用组件，Provider 组合
├── types.ts            # 核心类型定义 (UINode, UIAction, UserContext)
├── constants.ts        # COMPONENT_SPECS, SYSTEM_INSTRUCTION, FEW_SHOT_EXAMPLES
│
├── hooks/              # 应用层 Hooks
├── services/           # 领域服务层
├── components/         # UI 组件层
├── types/              # 扩展类型定义
├── tests/              # 测试文件
│
├── package.json        # 依赖配置
├── tsconfig.json       # TypeScript 配置
├── vite.config.ts      # Vite 构建配置
├── tailwind.config.js  # Tailwind 主题扩展
└── postcss.config.js   # PostCSS 插件
```

---

## Hooks 目录 (`hooks/`)

| 文件 | 行数 | 职责 |
|------|------|------|
| `useGenUI.ts` | 392 | **主编排器** - 状态管理、生成流程、组件修复 |
| `useActionDispatcher.ts` | 264 | **Action 分发** - Handler Registry Pattern |
| `useHistory.ts` | 79 | **时间旅行** - Undo/Redo 功能 |
| `useFormManager.ts` | 96 | **表单管理** - 收集/重置表单数据 |
| `useStatePatching.ts` | 122 | **状态补丁** - PATCH_STATE/CYCLE_STATE 处理 |
| `useSound.ts` | 4400B | **音效引擎** - UI 交互音效 |
| `useDebounce.ts` | 382B | **防抖** - 输入优化 |
| `useStableCallback.ts` | 1743B | **稳定回调** - 避免不必要重渲染 |

---

## Services 目录 (`services/`)

| 文件 | 行数 | 职责 |
|------|------|------|
| `geminiService.ts` | 334 | **AI 生成** - 流式响应、重试、超时 |
| `toolService.ts` | 349 | **工具执行** - 13 种工具 (天气/加密货币/翻译等) |
| `schemas.ts` | 447 | **Schema 验证** - 29 种 Zod 组件 Schema |
| `streamParser.ts` | 1718B | **流式解析** - 解析不完整 JSON |
| `telemetry.ts` | 3460B | **遥测** - TTFT、延迟、错误追踪 |
| `themeAgent.ts` | 1679B | **主题生成** - AI 驱动主题 |
| `codeGenerator.ts` | 3349B | **代码生成** - 导出 React 代码 |
| `validationCache.ts` | 2383B | **验证缓存** - Schema 验证结果缓存 |
| `animationCache.ts` | 1701B | **动画缓存** - Framer Motion variants 缓存 |
| `diagnosticData.ts` | 8510B | **诊断数据** - 测试用 UI 节点 |
| `imageFactory.ts` | 1657B | **图片工厂** - Pollinations URL 生成 |

### AI Provider (`services/ai/`)

| 文件 | 行数 | 职责 |
|------|------|------|
| `IAIProvider.ts` | 62B | **接口定义** - AI Provider Protocol |
| `GeminiProvider.ts` | 245 | **Gemini 实现** - 生成/修复/图像 |
| `index.ts` | 289B | **导出** |

---

## Components 目录 (`components/`)

### 核心渲染器

| 文件 | 行数 | 职责 |
|------|------|------|
| `DynamicRenderer.tsx` | 275 | **递归渲染器** - 验证 → 查找 → 渲染 → 自愈 |
| `EditorContext.tsx` | 1155B | **编辑器上下文** - 选中/悬停状态 |
| `ThemeContext.tsx` | 1308B | **主题上下文** - 动态主题切换 |

### UI 组件 (`components/ui/`)

**布局组件**:
- `Container.tsx` - Flex/Grid 容器
- `BentoGrid.tsx` - Bento 网格布局
- `SplitPane.tsx` - 可调整分割面板
- `Hero.tsx` - 英雄区块

**输入组件**:
- `Input.tsx` - 文本输入 + 验证
- `Textarea.tsx` - 多行文本
- `Switch.tsx` - 开关
- `Slider.tsx` - 滑块
- `Calendar.tsx` - 日期选择

**展示组件**:
- `Card.tsx` - 6 种变体卡片
- `StatCard.tsx` - 统计卡片
- `Progress.tsx` - 进度条
- `Alert.tsx` - 警告提示
- `Badge.tsx` - 徽章
- `Avatar.tsx` - 头像
- `Image.tsx` - 图片 + 占位符
- `Typography.tsx` - 排版组件

**复杂组件**:
- `Table.tsx` - 可排序/分页表格
- `Chart.tsx` - Recharts 图表
- `Tabs.tsx` - 标签页
- `Stepper.tsx` - 步骤器
- `Accordion.tsx` - 手风琴
- `Timeline.tsx` - 时间轴
- `Kanban.tsx` - 看板
- `Map.tsx` - 地图组件
- `CodeBlock.tsx` - 代码块

**基础设施**:
- `Registry.tsx` - **组件注册表** (26+ 组件)
- `theme.ts` - **主题 Token** (340 行样式)
- `animations.ts` - **动画定义** (18 种动画)
- `renderUtils.tsx` - **渲染工具** (getByPath, setByPath)

### Workspace (`components/workspace/`)

| 文件 | 职责 |
|------|------|
| `Sidebar.tsx` | 侧边栏 (聊天/图层) |
| `Toolbar.tsx` | 顶部工具栏 |
| `DeviceWrapper.tsx` | 设备模拟器 |

### Galgame (`components/galgame/`)

| 文件 | 职责 |
|------|------|
| `VNStage.tsx` | 视觉小说舞台 |
| `layers/` | 背景/角色/对话层 |

---

## Types 目录 (`types/`)

| 文件 | 职责 |
|------|------|
| `actions.ts` | ActionContext, ActionHandler 类型 |
| `settings.ts` | ModelConfig 配置类型 |

---

## Tests 目录 (`tests/`)

| 文件 | 职责 |
|------|------|
| `setup.ts` | Vitest 配置 |
| `constants.test.ts` | 常量测试 |
| `schemas.test.ts` | Schema 验证测试 |
| `streamParser.test.ts` | 流解析器测试 |
