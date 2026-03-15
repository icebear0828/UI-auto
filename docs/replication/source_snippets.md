# 源码片段

> [!IMPORTANT]
> 以下代码片段是项目复刻的核心，必须完整实现。

---

## 1. 核心类型定义 (`types.ts`)

```typescript
// 3.1 Recursive Data Structure & 3.2 Action Protocol
export interface UIAction {
  type: string;
  payload?: any;
  path?: string; // Dot notation path e.g. "0.children.1.input.value"
}

// The Node is a loose object where the KEY is the component type
export type UINode = {
  [key: string]: any;
};

// Allowed component types in our Registry
export type ComponentType = 
  | 'container' | 'text' | 'button' | 'card' | 'input' | 'textarea'
  | 'stat' | 'chart' | 'separator' | 'badge' | 'hero' | 'table'
  | 'progress' | 'alert' | 'avatar' | 'image' | 'map' | 'accordion'
  | 'switch' | 'slider' | 'tabs' | 'stepper' | 'timeline' | 'codeblock'
  | 'split_pane' | 'calendar' | 'vn_stage';

// User Context for Implicit Input
export interface UserContext {
  role: 'admin' | 'user';
  device: 'desktop' | 'mobile';
  theme: 'dark' | 'light';
  mode?: 'default' | 'galgame';
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  uiNode?: UINode;
}
```

### 设计决策
- `UINode` 使用松散对象结构，key 即组件类型
- `path` 支持深度嵌套组件的状态更新

---

## 2. 组件注册表 (`components/ui/Registry.tsx`)

```typescript
import React from 'react';
// ... imports

// Safe Lazy Loader - 自动处理 default/named export
function safeLazy<T extends React.ComponentType<any>>(
  importFunc: () => Promise<any>, 
  componentName?: string
): React.LazyExoticComponent<T> {
  return React.lazy(() => 
    importFunc().then(module => {
      if (module.default) return { default: module.default };
      if (componentName && module[componentName]) return { default: module[componentName] };
      const key = Object.keys(module).find(k => k[0] === k[0].toUpperCase() && typeof module[k] === 'function');
      if (key) return { default: module[key] };
      throw new Error(`Module loaded but Component not found.`);
    })
  );
}

// Lazy load heavy components
const ChartComponent = safeLazy(() => import('./Chart'), 'ChartComponent');
const MapWidget = safeLazy(() => import('./Map'), 'MapWidget');
const Table = safeLazy(() => import('./Table'), 'Table');
const VNStage = safeLazy(() => import('../galgame/VNStage'), 'VNStage');

export const ComponentRegistry: Record<string, React.FC<any>> = {
  container: Container,
  card: Card,
  text: Typography,
  button: Button,
  // ... 26+ components
  chart: ChartComponent,  // 懒加载
  table: Table,
  map: MapWidget,
  vn_stage: VNStage,
};
```

### 设计决策
- `safeLazy` 解决 default/named export 不一致问题
- 重型组件 (Chart, Map, Table, VNStage) 使用懒加载

---

## 3. 动态渲染器核心逻辑 (`DynamicRenderer.tsx`)

```typescript
const DynamicRenderer: React.FC<RendererProps> = ({ node, onAction, path = 'root', onError }) => {
  // 1. 验证层
  if (!node || typeof node !== 'object') return null;
  if (Object.keys(node).length === 0) return null;

  const { success, data: validNode, error } = cachedValidateNode(node);

  if (!success || !validNode) {
    telemetry.logEvent('render_validation', 'HALLUCINATION', { nodeKeys: Object.keys(node) });
    return <ValidationErrorUI error={error} />;
  }

  // 2. 查找组件类型
  const nodeKeys = Object.keys(validNode);
  const componentType = nodeKeys.find(key => ComponentRegistry[key]);

  if (!componentType) {
    return <UnknownComponentUI nodeKeys={nodeKeys} />;
  }

  // 3. 渲染
  const Component = ComponentRegistry[componentType];
  const props = validNode[componentType] || {};
  const { children, animation, ...restProps } = props;
  const currentPath = `${path}.${componentType}`;

  return (
    <ErrorBoundary node={node} path={path} onError={onError}>
      <motion.div variants={getCachedVariants(animation)} initial="hidden" animate="visible">
        <Component {...restProps} animation={animation} children={children} onAction={onAction} path={currentPath} onError={onError} />
      </motion.div>
    </ErrorBoundary>
  );
};
```

### 设计决策
- 验证 → 查找 → 渲染 的三步流程
- ErrorBoundary 捕获错误后触发自愈

---

## 4. Action 分发器 Handler Registry (`useActionDispatcher.ts`)

```typescript
// 模块级别处理器定义 (创建一次)
const handleSequence: ActionHandler = async (action, ctx) => {
    const actions = action.payload?.actions;
    if (Array.isArray(actions)) {
        for (const subAction of actions) {
            await ctx.dispatch(subAction);
        }
    }
};

const handleNavigate: ActionHandler = (action) => {
    const { url } = action.payload || {};
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
};

// ... 12+ handlers

// Handler Registry (O(1) 查找)
const HANDLER_REGISTRY: Record<string, ActionHandler> = {
    'SEQUENCE': handleSequence,
    'DELAY': handleDelay,
    'GO_BACK': handleGoBack,
    'NAVIGATE': handleNavigate,
    'TRIGGER_EFFECT': handleTriggerEffect,
    'SHOW_TOAST': handleShowToast,
    'COPY_TO_CLIPBOARD': handleCopyToClipboard,
    'DOWNLOAD': handleDownload,
    'OPEN_MODAL': handleOpenModal,
    'CLOSE_MODAL': handleCloseModal,
    'PATCH_STATE': handlePatchOrCycleState,
    'CYCLE_STATE': handlePatchOrCycleState,
    'RESET_FORM': handleResetForm,
    'SUBMIT_FORM': handleSubmitForm,
};

// Hook 内分发
export const useActionDispatcher = (deps) => {
    const dispatchImpl = useCallback(async (action: UIAction) => {
        const handler = HANDLER_REGISTRY[action.type];
        if (handler) {
            const ctx = { ...deps, dispatch: dispatchImpl };
            await handler(action, ctx);
        }
    }, [deps]);

    return useStableCallback(dispatchImpl);
};
```

### 设计决策
- 模块级别纯函数避免闭包重建
- `useStableCallback` 确保引用稳定

---

## 5. 流式 JSON 解析器 (`streamParser.ts`)

```typescript
export function parsePartialJson(input: string): any {
  if (!input?.trim()) return null;
  
  let cleaned = input.trim();
  
  // 尝试直接解析
  try {
    return JSON.parse(cleaned);
  } catch {}

  // 尝试修复未闭合的结构
  let openBraces = 0, openBrackets = 0;
  for (const char of cleaned) {
    if (char === '{') openBraces++;
    if (char === '}') openBraces--;
    if (char === '[') openBrackets++;
    if (char === ']') openBrackets--;
  }

  // 添加缺失的闭合符
  cleaned += ']'.repeat(Math.max(0, openBrackets));
  cleaned += '}'.repeat(Math.max(0, openBraces));

  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}
```

### 设计决策
- 支持流式渲染部分 JSON
- 自动修复未闭合的括号

---

## 6. 时间旅行 Hook (`useHistory.ts`)

```typescript
const MAX_HISTORY = 50;

export function useHistory<T>(initialState: T) {
  const [historyState, setHistoryState] = useState<{
    timeline: T[];
    index: number;
  }>({ timeline: [initialState], index: 0 });

  const state = historyState.timeline[historyState.index] ?? initialState;

  const setState = useCallback((newState: T | ((prev: T) => T), overwrite = false) => {
    setHistoryState(prev => {
      const { timeline, index } = prev;
      const currentState = timeline[index];
      const resolvedState = typeof newState === 'function' ? (newState as Function)(currentState) : newState;

      if (overwrite) {
        const newTimeline = [...timeline];
        newTimeline[index] = resolvedState;
        return { ...prev, timeline: newTimeline };
      }

      const newTimeline = timeline.slice(0, index + 1);
      newTimeline.push(resolvedState);
      let newIndex = newTimeline.length - 1;

      if (newTimeline.length > MAX_HISTORY) {
        newTimeline.shift();
        newIndex--;
      }

      return { timeline: newTimeline, index: newIndex };
    });
  }, []);

  const undo = useCallback(() => {
    setHistoryState(prev => ({ ...prev, index: Math.max(0, prev.index - 1) }));
  }, []);

  const redo = useCallback(() => {
    setHistoryState(prev => ({ ...prev, index: Math.min(prev.timeline.length - 1, prev.index + 1) }));
  }, []);

  return { state, setState, undo, redo, canUndo: historyState.index > 0, canRedo: historyState.index < historyState.timeline.length - 1 };
}
```

### 设计决策
- `overwrite` 模式用于流式更新 (不推入新历史)
- 最多保留 50 步历史
