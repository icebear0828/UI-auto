# 类型定义文档

> 本文档描述项目的完整类型系统

---

## 核心类型 (`types.ts`)

### UIAction

```typescript
export interface UIAction {
  type: string;       // Action 类型标识
  payload?: any;      // Action 数据
  path?: string;      // 目标路径 (dot notation)
}
```

**预定义 Action 类型**:

| type | payload | 说明 |
|------|---------|------|
| `NAVIGATE` | `{ url: string, target?: '_blank' \| '_self' }` | 导航 |
| `OPEN_MODAL` | `{ title?: string, content: UINode }` | 打开模态框 |
| `CLOSE_MODAL` | `{}` | 关闭模态框 |
| `TRIGGER_EFFECT` | `{ effect: 'CONFETTI' \| 'SNOW' }` | 触发特效 |
| `SHOW_TOAST` | `{ message: string, type: 'SUCCESS' \| 'ERROR' \| 'INFO' }` | Toast 通知 |
| `COPY_TO_CLIPBOARD` | `{ text: string }` | 复制文本 |
| `DOWNLOAD` | `{ filename: string, content: string }` | 下载文件 |
| `PATCH_STATE` | `{ key: value, ... }` | 局部状态更新 |
| `CYCLE_STATE` | `{ next: Array<ButtonProps> }` | 状态循环 |
| `SUBMIT_FORM` | `any` | 提交表单数据 |
| `RESET_FORM` | `{}` | 重置表单 |
| `SEQUENCE` | `{ actions: UIAction[] }` | 顺序执行 |
| `DELAY` | `{ ms: number }` | 延迟 |
| `GO_BACK` | `{}` | 撤销 |

---

### UINode

```typescript
export type UINode = {
  [key: string]: any;  // key 是组件类型
};

// 示例
const node: UINode = {
  container: {
    layout: 'COL',
    children: [
      { text: { content: 'Hello', variant: 'H1' } }
    ]
  }
};
```

---

### ComponentType

```typescript
export type ComponentType = 
  | 'container' | 'text' | 'button' | 'card' | 'input' | 'textarea'
  | 'stat' | 'chart' | 'separator' | 'badge' | 'hero' | 'table'
  | 'progress' | 'alert' | 'avatar' | 'image' | 'map' | 'accordion'
  | 'switch' | 'slider' | 'tabs' | 'stepper' | 'timeline' | 'codeblock'
  | 'split_pane' | 'calendar' | 'vn_stage' | 'bento_container' | 'bento_card'
  | 'kanban';
```

---

### UserContext

```typescript
export interface UserContext {
  role: 'admin' | 'user';
  device: 'desktop' | 'mobile';
  theme: 'dark' | 'light';
  mode?: 'default' | 'galgame';
}
```

---

### Message

```typescript
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  uiNode?: UINode;
}
```

---

## Action 类型 (`types/actions.ts`)

### ActionContext

```typescript
export interface ActionContext {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  showToast: (options: ToastOptions) => void;
  history: {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
  };
}
```

### ToastOptions

```typescript
export interface ToastOptions {
  type: 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING';
  title: string;
  description?: string;
}
```

### ActionHandler

```typescript
export type ActionHandler = (
  action: UIAction,
  context: ActionContext
) => Promise<void>;

export type ActionHandlerMap = Record<string, ActionHandler>;
```

---

## 设置类型 (`types/settings.ts`)

### ModelConfig

```typescript
export interface ModelConfig {
  model: string;
  soundEnabled: boolean;
}

export const DEFAULT_CONFIG: ModelConfig = {
  model: "gemini-3-flash-preview",
  soundEnabled: true
};
```

---

## Galgame 类型 (`types.ts`)

### ImageAsset

```typescript
export type ImageSource = "EXTERNAL_URL" | "GENERATED";

export interface ImageAsset {
  source: ImageSource;
  value: string;
  style?: string; // "ANIME", "REALISTIC", etc.
}
```

### VNCharacter

```typescript
export interface VNCharacter {
  id: string;
  name: string;
  avatar: ImageAsset;
  position: "LEFT" | "CENTER" | "RIGHT" | "CLOSE_UP";
  expression: "NEUTRAL" | "SMILE" | "ANGRY" | "BLUSH" | "SAD" | "SHOCKED";
  animation?: {
    type: string;
    delay?: number;
  }
}
```

### VNDialogue

```typescript
export interface VNDialogue {
  speaker: string;
  content: string;
  voice_id?: string;
  speed?: "SLOW" | "NORMAL" | "FAST";
}
```

### VNChoice

```typescript
export interface VNChoice {
  label: string;
  action: UIAction;
  style?: "DEFAULT" | "AGGRESSIVE" | "ROMANTIC";
}
```

### VNStageNode

```typescript
export interface VNStageNode {
  vn_stage: {
    background: ImageAsset;
    characters?: VNCharacter[];
    dialogue: VNDialogue;
    choices?: VNChoice[];
    bgm?: string;
    sfx?: string;
  }
}
```

---

## Zod Schema (`services/schemas.ts`)

项目使用 Zod 进行运行时验证，定义了 29 种组件 Schema：

```typescript
export const UINodeSchema: z.ZodType<any> = z.lazy(() => 
  z.union([
    ContainerNode, HeroNode, TextNode, ButtonNode, CardNode,
    TableNode, StatNode, ProgressNode, AlertNode, AvatarNode,
    ChartNode, AccordionNode, ImageNode, MapNode, InputNode,
    TextareaNode, BadgeNode, SeparatorNode, BentoContainerNode,
    BentoCardNode, KanbanNode, SwitchNode, SliderNode, TabsNode,
    StepperNode, TimelineNode, CodeBlockNode, SplitPaneNode,
    CalendarNode, VNStageNode
  ])
);

export const validateNode = (node: any) => {
  const result = UINodeSchema.safeParse(node);
  return result.success 
    ? { success: true, data: result.data }
    : { success: false, error: result.error };
};
```
